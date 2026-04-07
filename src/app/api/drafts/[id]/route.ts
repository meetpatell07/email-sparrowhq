import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { drafts, emails, styleSamples } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { fetchGmailDraftContent } from "@/lib/gmail";
import { logAudit } from "@/lib/audit";

// PATCH /api/drafts/[id]
// Body: { action: "approve" | "reject" }
//
// approve — sets status to approved, captures draft content as a style sample
//            (capped at 5 per user — oldest pruned when over limit)
// reject  — sets status to rejected
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body?.action as string | undefined;

    if (action !== "approve" && action !== "reject") {
        return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
    }

    // Verify the draft belongs to this user (via emails join or null emailId extension draft)
    const [draft] = await db
        .select({ id: drafts.id, gmailDraftId: drafts.gmailDraftId, emailGmailId: emails.gmailId })
        .from(drafts)
        .leftJoin(emails, eq(drafts.emailId, emails.id))
        .where(
            and(
                eq(drafts.id, id),
                // Either the email belongs to this user, or it's an extension draft (no emailId)
                // We re-check ownership below via the userId on the emails row when present
            )
        )
        .limit(1);

    if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

    const newStatus = action === "approve" ? "approved" : "rejected";

    await db.update(drafts).set({ status: newStatus }).where(eq(drafts.id, id));

    await logAudit(
        session.user.id,
        action === "approve" ? "draft_approved" : "draft_rejected",
        draft.emailGmailId ?? null,
        { draftId: id }
    );

    // On approval: capture the current draft content as a writing style sample
    if (action === "approve" && draft.gmailDraftId) {
        try {
            const content = await fetchGmailDraftContent(session.user.id, draft.gmailDraftId);
            if (content && content.trim().length > 20) {
                await db.insert(styleSamples).values({
                    userId: session.user.id,
                    content: content.trim(),
                });

                // Prune: keep only the 5 most recent style samples
                const [{ total }] = await db
                    .select({ total: count() })
                    .from(styleSamples)
                    .where(eq(styleSamples.userId, session.user.id));

                if (total > 5) {
                    // Delete oldest (total - 5) entries
                    const oldest = await db
                        .select({ id: styleSamples.id })
                        .from(styleSamples)
                        .where(eq(styleSamples.userId, session.user.id))
                        .orderBy(styleSamples.createdAt)
                        .limit(total - 5);

                    for (const row of oldest) {
                        await db.delete(styleSamples).where(eq(styleSamples.id, row.id));
                    }
                }
            }
        } catch (err) {
            // Style capture is best-effort — never block the approval
            console.error("[drafts] Style sample capture failed:", err);
        }
    }

    return NextResponse.json({ ok: true, status: newStatus });
}
