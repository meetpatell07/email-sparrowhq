
import { db } from "@/lib/db";
import { account, emails, attachments, invoices, drafts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getGmailClient, createGmailDraft } from "@/lib/gmail";
import { classifyEmail, extractInvoiceData, generateDraftReply } from "@/lib/ai";
import { s3, R2_BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function processIngestion(specificUserId?: string) {
    // 1. Get users to process
    let query = db.select().from(account).where(eq(account.providerId, 'google'));

    if (specificUserId) {
        // @ts-ignore - drizzle type complexity
        query = query.where(eq(account.userId, specificUserId));
    }

    const googleAccounts = await query;
    const results = [];

    for (const acc of googleAccounts) {
        try {
            const gmail = await getGmailClient(acc.userId);

            // Get last email date for sync
            const lastEmail = await db.select()
                .from(emails)
                .where(eq(emails.userId, acc.userId))
                .orderBy(desc(emails.receivedAt))
                .limit(1);

            let q = '';
            if (lastEmail.length > 0) {
                const seconds = Math.floor(lastEmail[0].receivedAt.getTime() / 1000) + 1;
                q = `after:${seconds}`;
            }

            // Fetch list
            const list = await gmail.users.messages.list({
                userId: 'me',
                q,
                maxResults: 10, // Limit per batch
            });

            const messages = list.data.messages || [];

            for (const msg of messages) {
                if (!msg.id) continue;

                // Fetch full detail
                const fullMsg = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id,
                    format: 'full',
                });

                const payload = fullMsg.data.payload;
                if (!payload) continue;

                const headers = payload.headers || [];
                const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
                const from = headers.find(h => h.name === 'From')?.value || '';
                const to = headers.find(h => h.name === 'To')?.value || '';
                const dateStr = headers.find(h => h.name === 'Date')?.value;
                const receivedAt = dateStr ? new Date(dateStr) : new Date();
                const snippet = fullMsg.data.snippet || '';

                // Extract body
                let body = snippet;
                if (payload.body?.data) {
                    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
                } else if (payload.parts) {
                    const part = payload.parts.find(p => p.mimeType === 'text/plain');
                    if (part && part.body?.data) {
                        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                    }
                }

                // Store Email
                const [emailRecord] = await db.insert(emails).values({
                    userId: acc.userId,
                    gmailId: msg.id,
                    threadId: fullMsg.data.threadId,
                    subject,
                    snippet,
                    body,
                    receivedAt,
                    sender: from,
                    recipient: to,
                    isProcessed: false
                }).returning({ id: emails.id }).onConflictDoNothing();

                if (!emailRecord) continue;

                // Attachments
                if (payload.parts) {
                    for (const part of payload.parts) {
                        if (part.filename && part.body?.attachmentId) {
                            const attParams = await gmail.users.messages.attachments.get({
                                userId: 'me',
                                messageId: msg.id,
                                id: part.body.attachmentId
                            });

                            if (attParams.data.data) {
                                const buffer = Buffer.from(attParams.data.data, 'base64');
                                const r2Key = `${acc.userId}/${msg.id}/${part.filename}`;

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
                                    r2Key
                                });
                            }
                        }
                    }
                }

                // AI Process
                const category = await classifyEmail(subject, snippet, body);
                await db.update(emails).set({ category, isProcessed: true }).where(eq(emails.id, emailRecord.id));

                if (category === 'invoice') {
                    const invoiceData = await extractInvoiceData(subject, body);
                    if (invoiceData.isInvoice) {
                        await db.insert(invoices).values({
                            emailId: emailRecord.id,
                            vendorName: invoiceData.vendorName,
                            amount: invoiceData.amount ? String(invoiceData.amount) : null,
                            currency: invoiceData.currency,
                            dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null,
                            extractedData: invoiceData
                        });
                    }
                }

                // Auto-draft for client and urgent emails
                if (category === 'urgent' || category === 'client') {
                    try {
                        const draftContent = await generateDraftReply(subject, body, from);

                        // Create draft in Gmail
                        const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
                        const gmailDraftId = await createGmailDraft(
                            acc.userId,
                            from, // Reply to sender
                            replySubject,
                            draftContent,
                            fullMsg.data.threadId || undefined
                        );

                        // Store in our database
                        await db.insert(drafts).values({
                            emailId: emailRecord.id,
                            gmailDraftId,
                            content: draftContent,
                            status: 'pending_approval'
                        });
                    } catch (draftError) {
                        console.error(`Failed to create auto-draft for email ${msg.id}:`, draftError);
                        // Continue processing other emails even if draft fails
                    }
                }

                results.push({ id: msg.id, category });
            }
        } catch (e: any) {
            console.error(`Error processing user ${acc.userId}:`, e);
        }
    }

    return results;
}
