import { google } from "googleapis";
import { db } from "@/lib/db";
import { account, emails } from "@/lib/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { decrypt } from "./encryption";

export async function getGmailClient(userId: string) {
    // Fetch user's google account
    const accounts = await db
        .select()
        .from(account)
        .where(eq(account.userId, userId));
    const googleAccount = accounts.find((acc) => acc.providerId === "google");

    if (!googleAccount || !googleAccount.refreshToken) {
        throw new Error(
            "User has no Google account linked or missing refresh token"
        );
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    // If we encrypted the refresh token, decrypt it here.
    // Note: Better Auth default storage might not be encrypted.
    // We assume here we are trying to decrypt it, or if it fails (not encrypted), we use it raw?
    // For the sake of the requirement "Encrypt refresh tokens", let's assume we handle it.
    // Since we haven't implemented the write-side encryption yet, this might fail if we try to decrypt plain text.
    // However, I will write it to support both or just decrypt assuming we solve the write side.

    let refreshToken: string = googleAccount.refreshToken;
    try {
        if (refreshToken.includes(":")) {
            refreshToken = await decrypt(refreshToken);
        }
    } catch {
        // ignore, might be plain text
    }

    oauth2Client.setCredentials({
        access_token: googleAccount.accessToken,
        refresh_token: refreshToken,
        // expiry_date: googleAccount.expiresAt?.getTime(), // Optional, google client handles refresh if token is there
    });

    // Handle token refresh events to update DB?
    // googleapis automatically refreshes access token if expired, providing we gave refresh token.
    // But we should probably listen to 'tokens' event to save new access token/refresh token if it rotates.

    oauth2Client.on("tokens", async (tokens) => {
        // Update DB
        // This is a bit tricky in serverless as this might happen during a request.
        // We should update the access token in DB.
        if (tokens.access_token) {
            await db
                .update(account)
                .set({
                    accessToken: tokens.access_token,
                    accessTokenExpiresAt: tokens.expiry_date
                        ? new Date(tokens.expiry_date)
                        : undefined,
                    // Update refresh token if provided (it rotates sometimes)
                    // refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined
                })
                .where(eq(account.id, googleAccount.id));
        }
    });

    return google.gmail({ version: "v1", auth: oauth2Client });
}

/**
 * Checks whether the user's Gmail watch is active and not expiring within 24 h.
 * If missing or about to expire, calls setupGmailWatch automatically.
 * Safe to call on every request — only does real work when needed.
 */
export async function ensureGmailWatch(userId: string): Promise<void> {
    const rows = await db
        .select({ gmailWatchExpiration: account.gmailWatchExpiration })
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.providerId, "google")))
        .limit(1);

    if (!rows.length) return;

    const expiration = rows[0].gmailWatchExpiration;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const needsRenewal = !expiration || expiration.getTime() - Date.now() < oneDayMs;

    if (needsRenewal) {
        await setupGmailWatch(userId);
    }
}

/**
 * Subscribes a user's Gmail inbox to Pub/Sub push notifications.
 * Must be called after OAuth and renewed weekly (Gmail watch expires in 7 days).
 */
export async function setupGmailWatch(userId: string): Promise<{ historyId: string; expiration: string }> {
    const gmail = await getGmailClient(userId);

    const res = await gmail.users.watch({
        userId: "me",
        requestBody: {
            topicName: `projects/${process.env.GCP_PROJECT_ID}/topics/${process.env.PUBSUB_TOPIC_NAME}`,
            labelIds: ["INBOX"],
            labelFilterBehavior: "INCLUDE",
        },
    });

    const historyId = res.data.historyId ?? "";
    const expiration = res.data.expiration ?? "";

    // Persist so we know the starting cursor and when to renew
    await db.update(account)
        .set({
            gmailHistoryId: String(historyId),
            gmailWatchExpiration: expiration ? new Date(parseInt(expiration)) : null,
        })
        .where(and(eq(account.userId, userId), eq(account.providerId, "google")));

    return { historyId: String(historyId), expiration: String(expiration) };
}

export interface GmailEmail {
    id: string;
    gmailId: string;
    subject: string;
    snippet: string;
    receivedAt: Date;
    sender: string;
    recipient: string;
    categories?: string[];
    isProcessed?: boolean;
}

export async function fetchEmailsFromGmail(
    userId: string,
    limit: number = 20
): Promise<GmailEmail[]> {
    try {
        const gmail = await getGmailClient(userId);

        // Fetch list of messages
        const listResponse = await gmail.users.messages.list({
            userId: "me",
            maxResults: limit,
        });

        const messages = listResponse.data.messages || [];
        const gmailIds = messages.map(m => m.id).filter(Boolean) as string[];

        // Fetch existing categories from DB for these IDs
        const dbEmails = await db.select({
            gmailId: emails.gmailId,
            categories: emails.categories,
            isProcessed: emails.isProcessed
        })
            .from(emails)
            .where(inArray(emails.gmailId, gmailIds));

        const dbMap = new Map(dbEmails.map(e => [e.gmailId, e]));
        const emailList: GmailEmail[] = [];

        // Fetch full details for each message
        for (const msg of messages) {
            if (!msg.id) continue;

            try {
                const fullMsg = await gmail.users.messages.get({
                    userId: "me",
                    id: msg.id,
                    format: "full",
                });

                const payload = fullMsg.data.payload;
                if (!payload) continue;

                const headers = payload.headers || [];
                const subject =
                    headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
                const from = headers.find((h) => h.name === "From")?.value || "";
                const to = headers.find((h) => h.name === "To")?.value || "";
                const dateStr = headers.find((h) => h.name === "Date")?.value;
                const receivedAt = dateStr ? new Date(dateStr) : new Date();
                const snippet = fullMsg.data.snippet || "";

                const dbRecord = dbMap.get(msg.id);

                emailList.push({
                    id: msg.id,
                    gmailId: msg.id,
                    subject,
                    snippet,
                    receivedAt,
                    sender: from,
                    recipient: to,
                    categories: dbRecord?.categories ?? undefined,
                    isProcessed: dbRecord?.isProcessed || false,
                });
            } catch (error) {
                console.error(`Error fetching message ${msg.id}:`, error);
            }
        }

        // Sort by receivedAt descending
        emailList.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());

        return emailList;
    } catch (error) {
        console.error("Error fetching emails from Gmail:", error);
        throw error;
    }
}

export interface GmailEmailDetail extends GmailEmail {
    body: string;
    htmlBody?: string;
    threadId?: string;
    cc?: string;
    bcc?: string;
    replyTo?: string;
}

export async function fetchEmailById(
    userId: string,
    messageId: string
): Promise<GmailEmailDetail | null> {
    try {
        const gmail = await getGmailClient(userId);

        const fullMsg = await gmail.users.messages.get({
            userId: "me",
            id: messageId,
            format: "full",
        });

        const payload = fullMsg.data.payload;
        if (!payload) return null;

        const headers = payload.headers || [];
        const subject =
            headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
        const from = headers.find((h) => h.name === "From")?.value || "";
        const to = headers.find((h) => h.name === "To")?.value || "";
        const cc = headers.find((h) => h.name === "Cc")?.value || "";
        const bcc = headers.find((h) => h.name === "Bcc")?.value || "";
        const replyTo = headers.find((h) => h.name === "Reply-To")?.value || "";
        const dateStr = headers.find((h) => h.name === "Date")?.value;
        const receivedAt = dateStr ? new Date(dateStr) : new Date();
        const snippet = fullMsg.data.snippet || "";

        // Extract body text - handle nested parts recursively
        let body = snippet;
        let htmlBody: string | undefined;

        const extractBodyFromPart = (
            part: {
                mimeType?: string | null;
                body?: { data?: string | null };
                parts?: Array<{
                    mimeType?: string | null;
                    body?: { data?: string | null };
                    parts?: unknown[];
                }>;
            } | null
        ): void => {
            if (!part) return;
            if (part.mimeType === "text/plain" && part.body?.data) {
                body = Buffer.from(part.body.data, "base64").toString("utf-8");
            } else if (part.mimeType === "text/html" && part.body?.data) {
                htmlBody = Buffer.from(part.body.data, "base64").toString("utf-8");
            } else if (part.parts) {
                // Recursively process nested parts
                for (const subPart of part.parts) {
                    extractBodyFromPart(subPart as typeof part);
                }
            }
        };

        if (payload.body?.data) {
            body = Buffer.from(payload.body.data, "base64").toString("utf-8");
        } else if (payload.parts) {
            for (const part of payload.parts) {
                extractBodyFromPart(part);
            }
        }

        return {
            id: messageId,
            gmailId: messageId,
            subject,
            snippet,
            receivedAt,
            sender: from,
            recipient: to,
            body,
            htmlBody,
            threadId: fullMsg.data.threadId || undefined,
            cc: cc || undefined,
            bcc: bcc || undefined,
            replyTo: replyTo || undefined,
        };
    } catch (error) {
        console.error(`Error fetching email ${messageId}:`, error);
        throw error;
    }
}

/**
 * Create a draft email in the user's Gmail account
 */
export async function createGmailDraft(
    userId: string,
    to: string,
    subject: string,
    body: string,
    threadId?: string,
    fromEmail?: string
): Promise<string> {
    console.log(`[draft] createGmailDraft called — to="${to}" subject="${subject}" threadId="${threadId ?? "none"}" fromEmail="${fromEmail ?? "none"}"`);

    const gmail = await getGmailClient(userId);
    console.log(`[draft] Gmail client obtained for userId=${userId}`);

    // Construct the email in RFC 2822 format.
    // From: header is required by RFC 2822 — Gmail API rejects drafts without it.
    const headerLines = [
        ...(fromEmail ? [`From: ${fromEmail}`] : []),
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/plain; charset="UTF-8"`,
    ];
    console.log(`[draft] RFC 2822 headers: ${headerLines.join(" | ")}`);

    const email = [...headerLines, ``, body].join("\r\n");

    // Base64url encode the email
    const encodedMessage = Buffer.from(email)
        .toString("base64")
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    console.log(`[draft] Calling gmail.users.drafts.create ...`);
    const response = await gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
            message: {
                raw: encodedMessage,
                threadId: threadId || undefined,
            }
        }
    });

    console.log(`[draft] API response — id="${response.data.id}" status=${response.status}`);

    if (!response.data.id) {
        throw new Error("Failed to create Gmail draft — API returned no id");
    }

    return response.data.id;
}

// ─── Gmail Label Management ─────────────────────────────────────────────────

// All labels are nested under this parent to avoid conflicts with Gmail's
// built-in labels (e.g. "Scheduled" is a Gmail system label for scheduled send).
const LABEL_PREFIX = "SparrowHQ";

// Every color MUST be in Gmail's allowed palette — any other hex is rejected.
// Full palette: https://developers.google.com/gmail/api/reference/rest/v1/users.labels
const LABEL_COLORS: Record<string, { backgroundColor: string; textColor: string }> = {
    to_do:        { backgroundColor: "#fb4c2f", textColor: "#ffffff" }, // red
    follow_up:    { backgroundColor: "#285bac", textColor: "#ffffff" }, // dark blue
    scheduled:    { backgroundColor: "#16a765", textColor: "#ffffff" }, // green
    finance:      { backgroundColor: "#0b804b", textColor: "#ffffff" }, // dark green  (was #0d652d — not in palette)
    work:         { backgroundColor: "#3c78d8", textColor: "#ffffff" }, // blue        (was #1a73e8 — not in palette)
    personal:     { backgroundColor: "#8e63ce", textColor: "#ffffff" }, // purple
    notification: { backgroundColor: "#ffad47", textColor: "#000000" }, // orange      (was #f2a60c — not in palette)
    marketing:    { backgroundColor: "#ac2b16", textColor: "#ffffff" }, // dark red
};

// Convert a category key → the nested Gmail label name displayed to the user.
// e.g.  to_do → "SparrowHQ/To Do"   follow_up → "SparrowHQ/Follow Up"
function categoryToLabelName(category: string): string {
    const display = category
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    return `${LABEL_PREFIX}/${display}`;
}

// In-memory cache per user: { userId → { category → labelId } }
const labelCache = new Map<string, Map<string, string>>();

/**
 * Ensures all SparrowHQ category labels exist in the user's Gmail account.
 * Returns a map of category → Gmail label ID.
 * Results are cached in memory for the lifetime of the server process.
 */
export async function ensureGmailLabels(userId: string): Promise<Map<string, string>> {
    if (labelCache.has(userId)) return labelCache.get(userId)!;

    const gmail = await getGmailClient(userId);
    const categories = Object.keys(LABEL_COLORS);

    // Fetch existing labels once
    const listRes = await gmail.users.labels.list({ userId: "me" });
    const existing = listRes.data.labels ?? [];

    const map = new Map<string, string>();

    for (const category of categories) {
        const labelName = categoryToLabelName(category); // e.g. "SparrowHQ/To Do"
        const found = existing.find((l) => l.name === labelName);

        if (found?.id) {
            map.set(category, found.id);
        } else {
            try {
                const created = await gmail.users.labels.create({
                    userId: "me",
                    requestBody: {
                        name: labelName,
                        labelListVisibility: "labelShow",
                        messageListVisibility: "show",
                        color: LABEL_COLORS[category],
                    },
                });
                if (created.data.id) {
                    map.set(category, created.data.id);
                    console.log(`[labels] Created "${labelName}" (${created.data.id})`);
                }
            } catch (err: any) {
                console.error(`[labels] Failed to create "${labelName}":`, err?.message ?? err);
            }
        }
    }

    labelCache.set(userId, map);
    return map;
}

/**
 * Applies the EmailHQ category labels to a Gmail message.
 * Accepts an array of categories; removes stale EmailHQ labels and applies all new ones.
 */
export async function applyGmailLabel(
    userId: string,
    messageId: string,
    categories: string[]
): Promise<void> {
    try {
        const labelMap = await ensureGmailLabels(userId);

        const addLabelIds = categories
            .map((cat) => labelMap.get(cat))
            .filter(Boolean) as string[];

        if (addLabelIds.length === 0) return;

        const removeLabelIds = [...labelMap.entries()]
            .filter(([cat]) => !categories.includes(cat))
            .map(([, id]) => id);

        const gmail = await getGmailClient(userId);
        await gmail.users.messages.modify({
            userId: "me",
            id: messageId,
            requestBody: {
                addLabelIds,
                removeLabelIds,
            },
        });
    } catch (err) {
        console.error(`Failed to apply Gmail label for message ${messageId}:`, err);
        // Non-fatal — don't block ingestion
    }
}
