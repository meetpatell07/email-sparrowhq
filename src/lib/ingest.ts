import { db } from "@/lib/db";
import { user, account, emails, attachments, invoices, drafts, styleSamples } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getGmailClient, createGmailDraft, applyGmailLabel } from "@/lib/gmail";
import { classifyEmail, extractInvoiceData, generateDraftReply, shouldGenerateDraft } from "@/lib/ai";
import { logAudit } from "@/lib/audit";
import { s3, R2_BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { redis } from "@/lib/redis";

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
    const gmail = await getGmailClient(userId);

    const fullMsg = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
    });

    const payload = fullMsg.data.payload;
    if (!payload) return null;

    // ── Draft-loop guard ────────────────────────────────────────────────────
    // Gmail fires a history event when we save a draft reply, which would
    // re-enter this function, get classified as "important", and create
    // another draft — looping forever. Block it at the earliest point.
    const labelIds = fullMsg.data.labelIds ?? [];
    if (labelIds.includes('DRAFT') || labelIds.includes('SENT')) {
        console.log(`[ingest] Skipping ${messageId} — is DRAFT or SENT message`);
        return null;
    }

    const headers = payload.headers || [];
    const subject = headers.find((h) => h.name === 'Subject')?.value || '(No Subject)';
    const from = headers.find((h) => h.name === 'From')?.value || '';
    // `to` / `snippet` / `subject` are used in-memory for AI classification and draft
    // generation only — they are never written to the database (privacy-first).
    const dateStr = headers.find((h) => h.name === 'Date')?.value;
    const receivedAt = dateStr ? new Date(dateStr) : new Date();
    const snippet = fullMsg.data.snippet || '';

    // ── Self-sender guard ───────────────────────────────────────────────────
    // If the user sent this message themselves (e.g. a sent mail event),
    // skip it entirely — no need to classify or draft a reply to yourself.
    const [userRecord] = await db.select({ email: user.email, name: user.name })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
    const userEmail = userRecord?.email ?? null;
    const userName = userRecord?.name || userRecord?.email || "Unknown";

    if (userEmail && from.toLowerCase().includes(userEmail.toLowerCase())) {
        console.log(`[ingest] Skipping ${messageId} — sender is self (${from})`);
        await logAudit(userId, "draft_skipped_self_sender", messageId, { reason: "sender_is_self" });
        return null;
    }

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

    // Store only operational metadata — no email content ever touches the DB.
    // subject / snippet / sender / recipient stay in-memory for AI processing only.
    const [emailRecord] = await db.insert(emails).values({
        userId,
        gmailId: messageId,
        threadId: fullMsg.data.threadId,
        receivedAt,
        isProcessed: false,
    }).returning({ id: emails.id }).onConflictDoNothing();

    if (!emailRecord) {
        return null;
    }

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
    const categories = await classifyEmail(subject, snippet, body);

    await db.update(emails)
        .set({ categories, isProcessed: true })
        .where(eq(emails.id, emailRecord.id));

    await logAudit(userId, "email_classified", messageId, { categories });

    // Apply Gmail labels — must be awaited; fire-and-forget gets killed by serverless before it resolves
    await applyGmailLabel(userId, messageId, categories);
    await logAudit(userId, "label_applied", messageId, { categories });

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
            await logAudit(userId, "invoice_extracted", messageId, {
                vendorName: invoiceData.vendorName,
                amount: invoiceData.amount,
                currency: invoiceData.currency,
            });
        }
    }

    // Auto-draft only for action categories: important and follow_up.
    // Scheduled is intentionally excluded — calendar events don't need a drafted reply.
    const needsDraft =
        categories.includes('important') ||
        categories.includes('follow_up');

    if (needsDraft) {
        // ── AI gate: does this email actually warrant a reply? ──────────────
        // Filters out automated alerts, FYI-only emails, no-reply senders, etc.
        // even when they land in an action category.
        const draftNeeded = await shouldGenerateDraft(subject, body, from).catch(() => true);
        if (!draftNeeded) {
            console.log(`[ingest] Skipping draft for ${messageId} — AI determined no reply needed`);
            await logAudit(userId, "draft_skipped_ai_gate", messageId, {
                reason: "ai_determined_no_reply_needed",
                categories,
            });
        } else {

        // ── Thread deduplication guard ──────────────────────────────────────
        // If this thread already has a draft (pending or otherwise), don't
        // create another one. This is the last line of defence against loops
        // that slip past the DRAFT/SENT label checks above.
        const threadId = fullMsg.data.threadId;
        const existingDraft = threadId
            ? await db.select({ id: drafts.id })
                .from(drafts)
                .innerJoin(emails, eq(drafts.emailId, emails.id))
                .where(and(eq(emails.threadId, threadId), eq(emails.userId, userId)))
                .limit(1)
            : [];

        if (existingDraft.length > 0) {
            console.log(`[ingest] Skipping draft for ${messageId} — thread ${threadId} already has a draft`);
            await logAudit(userId, "draft_skipped_thread_exists", messageId, { threadId });
        } else
        try {
            const { getCalendarContextForDraft } = await import("@/lib/calendar-context");
            const calendarContext = await getCalendarContextForDraft(userId, categories);

            // Load user's style samples to teach the AI their writing style
            const userStyleSamples = await db.select({ content: styleSamples.content })
                .from(styleSamples)
                .where(eq(styleSamples.userId, userId))
                .orderBy(desc(styleSamples.createdAt))
                .limit(3);
            const styleExamples = userStyleSamples.map(s => s.content);

            const draftContent = await generateDraftReply(subject, body, from, userName, calendarContext, styleExamples);

            const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;

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
                // content not stored — draft body lives exclusively in Gmail Drafts
                status: 'pending_approval',
            });
            await logAudit(userId, "draft_created", messageId, {
                categories,
                gmailDraftId,
                usedStyleSamples: styleExamples.length,
            });
            console.log(`[ingest] ✓ Draft saved to DB`);
        } catch (draftErr: any) {
            console.error(`[ingest] ✗ Draft creation FAILED for ${messageId}:`);
            console.error(`[ingest]   Error name:    ${draftErr?.name}`);
            console.error(`[ingest]   Error message: ${draftErr?.message}`);
            console.error(`[ingest]   Error code:    ${draftErr?.code}`);
            console.error(`[ingest]   Full error:`, draftErr);
        }
        } // end draftNeeded block
    }

    // Bust the Redis email list cache so the next UI fetch reflects this email.
    // Fire-and-forget — cache miss is always recoverable.
    redis.del(`emails:${userId}`).catch((e) =>
        console.error('[ingest] Redis cache invalidation failed:', e)
    );

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
