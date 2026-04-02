import { db } from "@/lib/db";
import { account, emails, attachments, invoices, drafts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getGmailClient, createGmailDraft, applyGmailLabel } from "@/lib/gmail";
import { classifyEmail, extractInvoiceData, generateDraftReply } from "@/lib/ai";
import { s3, R2_BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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
): Promise<{ id: string; category: string } | null> {
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

    // Decode body
    let body = snippet;
    if (payload.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
        const textPart = payload.parts.find((p) => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
    }

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

    if (!emailRecord) return null;

    // Upload attachments to R2
    if (payload.parts) {
        for (const part of payload.parts) {
            if (part.filename && part.body?.attachmentId) {
                try {
                    const attData = await gmail.users.messages.attachments.get({
                        userId: 'me',
                        messageId,
                        id: part.body.attachmentId,
                    });

                    if (attData.data.data) {
                        const buffer = Buffer.from(attData.data.data, 'base64');
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
                            size: part.body.size,
                            r2Key,
                        });
                    }
                } catch (attErr) {
                    console.error(`Attachment upload failed for ${messageId}:`, attErr);
                }
            }
        }
    }

    // Classify with AI
    const category = await classifyEmail(subject, snippet, body);
    await db.update(emails)
        .set({ category, isProcessed: true })
        .where(eq(emails.id, emailRecord.id));

    // Apply Gmail label (fire-and-forget)
    applyGmailLabel(userId, messageId, category).catch((err) =>
        console.error(`Label apply failed for ${messageId}:`, err)
    );

    // Invoice extraction
    if (category === 'invoice') {
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

    // Auto-draft for urgent/client emails
    if (category === 'urgent' || category === 'client') {
        try {
            const draftContent = await generateDraftReply(subject, body, from);
            const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;

            const gmailDraftId = await createGmailDraft(
                userId,
                from,
                replySubject,
                draftContent,
                fullMsg.data.threadId || undefined
            );

            await db.insert(drafts).values({
                emailId: emailRecord.id,
                gmailDraftId,
                content: draftContent,
                status: 'pending_approval',
            });
        } catch (draftErr) {
            console.error(`Draft creation failed for ${messageId}:`, draftErr);
        }
    }

    return { id: messageId, category };
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
