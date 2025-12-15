
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, account, emails, attachments, invoices, drafts } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getGmailClient } from "@/lib/gmail";
import { classifyEmail, extractInvoiceData, generateDraftReply } from "@/lib/ai";
import { s3, R2_BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const maxDuration = 60; // 1 minute timeout for Pro/Hobby

export async function GET(req: Request) {
    // Security check for Cron
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 1. Get all users with Google accounts
    const googleAccounts = await db.select().from(account).where(eq(account.providerId, 'google'));

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

            let query = '';
            if (lastEmail.length > 0) {
                const seconds = Math.floor(lastEmail[0].receivedAt.getTime() / 1000) + 1;
                query = `after:${seconds}`;
            }

            // Fetch list
            const list = await gmail.users.messages.list({
                userId: 'me',
                q: query,
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

                // Extract body (this is complex in MIME, simplified here)
                let body = snippet;
                if (payload.body?.data) {
                    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
                } else if (payload.parts) {
                    // Very simple text extraction
                    const part = payload.parts.find(p => p.mimeType === 'text/plain');
                    if (part && part.body?.data) {
                        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                    }
                }

                // 3. Store Email
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
                    isProcessed: false // Set to true after AI processing
                }).returning({ id: emails.id }).onConflictDoNothing(); // If already exists

                if (!emailRecord) continue; // Already processed

                // 4. Attachments (Upload to R2)
                // Simplified attachment handling
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

                // 5. AI Process
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

                if (category === 'urgent') {
                    const draft = await generateDraftReply(subject, body, from);
                    await db.insert(drafts).values({
                        emailId: emailRecord.id,
                        content: draft,
                        status: 'pending_approval'
                    });
                }

                results.push({ id: msg.id, category });
            }
        } catch (e: any) {
            console.error(`Error processing user ${acc.userId}:`, e);
            // continue to next user
        }
    }

    return NextResponse.json({ success: true, processed: results.length });
}
