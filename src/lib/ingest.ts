import { db } from "@/lib/db";
import { user, account, emails, attachments, invoices, drafts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getGmailClient, createGmailDraft, applyGmailLabel } from "@/lib/gmail";
import { classifyEmail, extractInvoiceData, generateDraftReply } from "@/lib/ai";
import { s3, R2_BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

// Recursively flatten all leaf parts of a multipart Gmail message.
// Handles arbitrary nesting (multipart/mixed > multipart/related > etc.)
function flattenParts(parts: any[]): any[] {
    const result: any[] = [];
    for (const part of parts) {
        if (part.parts?.length) {
            result.push(...flattenParts(part.parts));
        } else {
            result.push(part);
        }
    }
    return result;
}

// Returns new Gmail message IDs for a user that haven't been ingested yet.
export async function listNewEmailIds(userId: string): Promise<string[]> {
    const gmail = await getGmailClient(userId);

    const lastEmail = await db.select()
        .from(emails)
        .where(eq(emails.userId, userId))
        .orderBy(desc(emails.receivedAt))
        .limit(1);

    let q = '';
    if (lastEmail.length > 0) {
        const seconds = Math.floor(lastEmail[0].receivedAt.getTime() / 1000) + 1;
        q = `after:${seconds}`;
    }

    const list = await gmail.users.messages.list({
        userId: 'me',
        q,
        maxResults: 10,
    });

    return (list.data.messages || []).map((m) => m.id!).filter(Boolean);
}

// Fully processes a single Gmail message: fetches it, stores it, classifies it,
// extracts invoice data, and generates a draft reply when needed.
export async function processSingleEmail(
    userId: string,
    messageId: string
): Promise<{ id: string; categories: string[] } | null> {
    console.log(`\n[ingest] ── START processSingleEmail ──────────────────`);
    console.log(`[ingest] userId=${userId}  messageId=${messageId}`);

    const gmail = await getGmailClient(userId);

    const fullMsg = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
    });

    const payload = fullMsg.data.payload;
    if (!payload) return null;

    const headers = payload.headers || [];
    const subject = headers.find((h) => h.name === 'Subject')?.value || '(No Subject)';
    const from = headers.find((h) => h.name === 'From')?.value || '';
    const to = headers.find((h) => h.name === 'To')?.value || '';
    const dateStr = headers.find((h) => h.name === 'Date')?.value;
    const receivedAt = dateStr ? new Date(dateStr) : new Date();
    const snippet = fullMsg.data.snippet || '';

    // Decode body — must search recursively because Gmail nests text/plain
    // inside multipart/alternative which itself lives inside multipart/mixed.
    // A flat payload.parts.find('text/plain') always misses it.
    let body = snippet;
    if (payload.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
        const allBodyParts = flattenParts(payload.parts);
        const textPart = allBodyParts.find((p) => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
    }

    console.log(`[ingest] subject="${subject}"  from="${from}"`);
    console.log(`[ingest] body length=${body.length} chars (snippet fallback=${body === snippet})`);

    // Store email — skip silently if already exists (duplicate delivery)
    // Body is intentionally not persisted; it is kept in memory only for AI processing.
    const [emailRecord] = await db.insert(emails).values({
        userId,
        gmailId: messageId,
        threadId: fullMsg.data.threadId,
        subject,
        snippet,
        receivedAt,
        sender: from,
        recipient: to,
        isProcessed: false,
    }).returning({ id: emails.id }).onConflictDoNothing();

    if (!emailRecord) {
        console.log(`[ingest] Email already in DB — skipping (duplicate delivery)`);
        return null;
    }
    console.log(`[ingest] Email inserted → dbId=${emailRecord.id}`);

    // Upload attachments to R2 — walk ALL nested parts recursively
    const allParts = payload.parts ? flattenParts(payload.parts) : [];
    for (const part of allParts) {
        // Skip non-attachment parts (no filename = body text/html)
        if (!part.filename) continue;

        try {
            let buffer: Buffer | null = null;

            if (part.body?.attachmentId) {
                // Large attachment stored separately by Gmail (> 2 KB)
                const attData = await gmail.users.messages.attachments.get({
                    userId: 'me',
                    messageId,
                    id: part.body.attachmentId,
                });
                if (attData.data.data) {
                    buffer = Buffer.from(attData.data.data, 'base64');
                }
            } else if (part.body?.data) {
                // Small inline attachment (≤ 2 KB) — data is embedded directly
                buffer = Buffer.from(part.body.data, 'base64');
            }

            if (!buffer) continue;

            const r2Key = `${userId}/${messageId}/${part.filename}`;

            await s3.send(new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: r2Key,
                Body: buffer,
                ContentType: part.mimeType || 'application/octet-stream',
            }));

            await db.insert(attachments).values({
                emailId: emailRecord.id,
                filename: part.filename,
                contentType: part.mimeType,
                size: buffer.length,
                r2Key,
            });
        } catch (attErr) {
            console.error(`Attachment upload failed [${part.filename}] for ${messageId}:`, attErr);
        }
    }

    // Classify with AI
    console.log(`[ingest] Classifying email …`);
    const categories = await classifyEmail(subject, snippet, body);
    console.log(`[ingest] Categories assigned: [${categories.join(", ")}]`);

    await db.update(emails)
        .set({ categories, isProcessed: true })
        .where(eq(emails.id, emailRecord.id));

    // Apply Gmail labels (fire-and-forget)
    applyGmailLabel(userId, messageId, categories).catch((err) =>
        console.error(`[ingest] Label apply failed for ${messageId}:`, err)
    );

    // Invoice extraction
    if (categories.includes('finance')) {
        const invoiceData = await extractInvoiceData(subject, body);
        if (invoiceData.isInvoice) {
            await db.insert(invoices).values({
                emailId: emailRecord.id,
                vendorName: invoiceData.vendorName,
                amount: invoiceData.amount ? String(invoiceData.amount) : null,
                currency: invoiceData.currency,
                dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null,
                extractedData: invoiceData,
            });
        }
    }

    // Auto-draft for emails requiring action (to_do / follow_up / scheduled)
    const needsDraft =
        categories.includes('to_do') ||
        categories.includes('follow_up') ||
        categories.includes('scheduled');

    console.log(`[ingest] needsDraft=${needsDraft}  (to_do=${categories.includes('to_do')} follow_up=${categories.includes('follow_up')} scheduled=${categories.includes('scheduled')})`);

    if (needsDraft) {
        try {
            // Resolve sender email for the From: header (required by RFC 2822)
            const [userRecord] = await db.select({ email: user.email })
                .from(user)
                .where(eq(user.id, userId))
                .limit(1);
            const userEmail = userRecord?.email ?? null;
            console.log(`[ingest] User email for From header: ${userEmail}`);

            console.log(`[ingest] Calling generateDraftReply …`);
            const draftContent = await generateDraftReply(subject, body, from);
            console.log(`[ingest] Draft content (first 120 chars): "${draftContent.slice(0, 120)}"`);

            const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;

            console.log(`[ingest] Calling createGmailDraft …`);
            const gmailDraftId = await createGmailDraft(
                userId,
                from,
                replySubject,
                draftContent,
                fullMsg.data.threadId || undefined,
                userEmail ?? undefined
            );
            console.log(`[ingest] ✓ Gmail draft created — gmailDraftId=${gmailDraftId}`);

            await db.insert(drafts).values({
                emailId: emailRecord.id,
                gmailDraftId,
                content: draftContent,
                status: 'pending_approval',
            });
            console.log(`[ingest] ✓ Draft saved to DB`);
        } catch (draftErr: any) {
            console.error(`[ingest] ✗ Draft creation FAILED for ${messageId}:`);
            console.error(`[ingest]   Error name:    ${draftErr?.name}`);
            console.error(`[ingest]   Error message: ${draftErr?.message}`);
            console.error(`[ingest]   Error code:    ${draftErr?.code}`);
            console.error(`[ingest]   Full error:`, draftErr);
        }
    }

    console.log(`[ingest] ── END processSingleEmail ────────────────────\n`);
    return { id: messageId, categories };
}

// Used in local/dev environments where QStash isn't available.
export async function processIngestion(specificUserId?: string) {
    let query = db.select().from(account).where(eq(account.providerId, 'google'));

    if (specificUserId) {
        // @ts-ignore - drizzle type complexity
        query = query.where(eq(account.userId, specificUserId));
    }

    const googleAccounts = await query;
    const results = [];

    for (const acc of googleAccounts) {
        try {
            const messageIds = await listNewEmailIds(acc.userId);
            for (const messageId of messageIds) {
                const result = await processSingleEmail(acc.userId, messageId);
                if (result) results.push(result);
            }
        } catch (e: any) {
            console.error(`Error processing user ${acc.userId}:`, e);
        }
    }

    return results;
}
