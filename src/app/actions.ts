
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { drafts, emails, account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getGmailClient, applyGmailLabel } from "@/lib/gmail";
import { revalidatePath } from "next/cache";


import { processIngestion } from "@/lib/ingest";
import { classifyEmail } from "@/lib/ai";

export async function classifyIndividualEmail(gmailId: string, subject: string, snippet: string, receivedAt: Date) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Try to find if it exists in DB first
    const existing = await db.select().from(emails).where(eq(emails.gmailId, gmailId)).limit(1);

    let emailId: string;
    if (existing.length === 0) {
        // Create it
        const [inserted] = await db.insert(emails).values({
            userId: session.user.id,
            gmailId,
            subject,
            snippet,
            receivedAt,
            isProcessed: false
        }).returning({ id: emails.id });
        emailId = inserted.id;
    } else {
        emailId = existing[0].id;
    }

    const category = await classifyEmail(subject, snippet);
    await db.update(emails).set({ category, isProcessed: true }).where(eq(emails.id, emailId));

    // Apply Gmail label in the background
    applyGmailLabel(session.user.id, gmailId, category).catch(console.error);

    revalidatePath("/dashboard");
    return { success: true, category };
}

// ... existing imports

export async function signOutAndClearTokens() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (session) {
        // Clear tokens from account table
        await db.update(account).set({
            accessToken: null,
            refreshToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
        }).where(eq(account.userId, session.user.id));
    }

    return { success: true };
}

export async function syncEmails() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const results = await processIngestion(session.user.id);
    revalidatePath("/dashboard");
    return { success: true, count: results.length };
}

export async function approveDraft(draftId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Fetch draft
    const draftList = await db.select({
        draft: drafts,
        email: emails
    })
        .from(drafts)
        .innerJoin(emails, eq(drafts.emailId, emails.id))
        .where(and(eq(drafts.id, draftId), eq(emails.userId, session.user.id)));

    const item = draftList[0];
    if (!item) throw new Error("Draft not found");

    const { draft, email } = item;

    // Send via Gmail
    const gmail = await getGmailClient(session.user.id);

    // Construct raw email
    // Headers: To (Original Sender), Subject (Re: ...), In-Reply-To
    const rawMessage = makeBody(
        email.subject?.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
        email.sender || "recipient@example.com",
        draft.content
    );

    try {
        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: rawMessage,
                threadId: email.threadId || undefined
            }
        });

        // Update status
        await db.update(drafts).set({ status: 'sent' }).where(eq(drafts.id, draftId));
        revalidatePath("/dashboard");
        return { success: true };
    } catch (e) {
        console.error(e);
        throw new Error("Failed to send email");
    }
}

export async function discardDraft(draftId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Verify ownership via join
    const exists = await db.select({ id: drafts.id })
        .from(drafts)
        .innerJoin(emails, eq(drafts.emailId, emails.id))
        .where(and(eq(drafts.id, draftId), eq(emails.userId, session.user.id)));

    if (exists.length === 0) throw new Error("Draft not found");

    // Delete the draft
    await db.delete(drafts).where(eq(drafts.id, draftId));
    revalidatePath("/dashboard/drafts");
    return { success: true };
}


// Helper to base64url encode email
function makeBody(subject: string, to: string, body: string) {
    const str = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        `MIME-Version: 1.0`,
        `Content-Transfer-Encoding: 7bit`,
        ``,
        body
    ].join("\n");

    return Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
