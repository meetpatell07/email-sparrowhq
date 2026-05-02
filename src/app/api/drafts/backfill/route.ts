import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { emails, drafts, styleSamples, user } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { createGmailDraft, getGmailClient } from "@/lib/gmail";
import { generateDraftReply } from "@/lib/ai";
import { getCalendarContextForDraft } from "@/lib/calendar-context";
import { logAudit } from "@/lib/audit";

const DRAFT_CATEGORIES = ['priority', 'follow_up', 'scheduled'];

/**
 * POST /api/drafts/backfill
 *
 * Scans all of the authenticated user's emails classified as priority,
 * follow_up, or scheduled that do not yet have a draft, and creates one
 * for each. Safe to call multiple times — thread dedup prevents duplicates.
 */
export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Find all emails in draft-eligible categories that have no draft yet
    const eligible = await db
        .select({ id: emails.id, gmailId: emails.gmailId, threadId: emails.threadId, categories: emails.categories })
        .from(emails)
        .where(
            eq(emails.userId, userId)
        )
        .orderBy(desc(emails.receivedAt));

    // Filter to only draft-eligible categories in JS (avoids complex Drizzle array-overlap SQL)
    const needsDraft = eligible.filter(
        (e) => e.categories?.some((c) => DRAFT_CATEGORIES.includes(c))
    );

    if (needsDraft.length === 0) {
        return NextResponse.json({ created: 0, message: "No eligible emails found" });
    }

    // Find which of those already have a draft
    const emailIds = needsDraft.map((e) => e.id);
    const existingDrafts = await db
        .select({ emailId: drafts.emailId })
        .from(drafts)
        .where(inArray(drafts.emailId, emailIds));

    const alreadyDraftedIds = new Set(existingDrafts.map((d) => d.emailId));

    const toProcess = needsDraft.filter((e) => !alreadyDraftedIds.has(e.id));

    if (toProcess.length === 0) {
        return NextResponse.json({ created: 0, message: "All eligible emails already have drafts" });
    }

    // Fetch user's name for the sign-off
    const [userRecord] = await db
        .select({ name: user.name, email: user.email })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

    const userName = userRecord?.name || userRecord?.email || "Unknown";
    const userEmail = userRecord?.email ?? undefined;

    // Load style samples once
    const styleRows = await db
        .select({ content: styleSamples.content })
        .from(styleSamples)
        .where(eq(styleSamples.userId, userId))
        .orderBy(desc(styleSamples.createdAt))
        .limit(3);
    const styleExamples = styleRows.map((s) => s.content);

    const gmail = await getGmailClient(userId);

    let created = 0;
    const errors: { gmailId: string; error: string }[] = [];

    for (const email of toProcess) {
        try {
            // Fetch message from Gmail to get subject, sender, body
            const fullMsg = await gmail.users.messages.get({
                userId: 'me',
                id: email.gmailId,
                format: 'full',
            });

            const payload = fullMsg.data.payload;
            if (!payload) continue;

            // Skip DRAFT/SENT — shouldn't happen but be safe
            const labelIds = fullMsg.data.labelIds ?? [];
            if (labelIds.includes('DRAFT') || labelIds.includes('SENT')) continue;

            const hdrs = payload.headers ?? [];
            const subject = hdrs.find((h) => h.name === 'Subject')?.value || '(No Subject)';
            const from = hdrs.find((h) => h.name === 'From')?.value || '';

            // Skip self-sent
            if (userEmail && from.toLowerCase().includes(userEmail.toLowerCase())) continue;

            // Decode body
            let body = fullMsg.data.snippet || '';
            if (payload.body?.data) {
                body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
            } else if (payload.parts) {
                const flatten = (parts: any[]): any[] =>
                    parts.flatMap((p) => (p.parts?.length ? flatten(p.parts) : [p]));
                const textPart = flatten(payload.parts).find((p) => p.mimeType === 'text/plain');
                if (textPart?.body?.data) {
                    body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
                }
            }

            const categories = email.categories ?? [];
            const calendarContext = await getCalendarContextForDraft(userId, categories);
            const draftContent = await generateDraftReply(subject, body, from, userName, calendarContext, styleExamples);
            const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;

            const gmailDraftId = await createGmailDraft(
                userId,
                from,
                replySubject,
                draftContent,
                fullMsg.data.threadId || undefined,
                userEmail
            );

            await db.insert(drafts).values({
                emailId: email.id,
                gmailDraftId,
                status: 'pending_approval',
            });

            await logAudit(userId, "draft_created", email.gmailId, {
                categories,
                gmailDraftId,
                source: 'backfill_endpoint',
                usedStyleSamples: styleExamples.length,
            });

            created++;
        } catch (err: any) {
            const errMsg = err?.message ?? String(err);
            console.error(`[backfill] Failed for gmailId=${email.gmailId}:`, errMsg);
            await logAudit(userId, "draft_failed", email.gmailId, {
                categories: email.categories,
                error: errMsg,
                source: 'backfill_endpoint',
            });
            errors.push({ gmailId: email.gmailId, error: errMsg });
        }
    }

    return NextResponse.json({
        created,
        attempted: toProcess.length,
        errors: errors.length > 0 ? errors : undefined,
    });
}
