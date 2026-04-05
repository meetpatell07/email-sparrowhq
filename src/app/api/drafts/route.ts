import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { drafts, emails } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
    fetchEmailMetadataById,
    fetchGmailDraftContent,
} from "@/lib/gmail";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch only operational metadata — no content fields exist in the schema
        const userDrafts = await db
            .select({
                id: drafts.id,
                gmailDraftId: drafts.gmailDraftId,
                status: drafts.status,
                createdAt: drafts.createdAt,
                emailId: drafts.emailId,
                emailGmailId: emails.gmailId,
            })
            .from(drafts)
            .innerJoin(emails, eq(drafts.emailId, emails.id))
            .where(eq(emails.userId, session.user.id))
            .orderBy(drafts.createdAt);

        if (userDrafts.length === 0) {
            return NextResponse.json({ drafts: [] });
        }

        // Enrich each draft with live Gmail data in parallel.
        // fetchEmailMetadataById uses format=metadata (no body download).
        // fetchGmailDraftContent fetches the draft text from Gmail Drafts API.
        const enriched = await Promise.all(
            userDrafts.map(async (draft) => {
                const [emailMeta, content] = await Promise.all([
                    fetchEmailMetadataById(session.user.id, draft.emailGmailId).catch(
                        () => null
                    ),
                    draft.gmailDraftId
                        ? fetchGmailDraftContent(session.user.id, draft.gmailDraftId).catch(
                              () => ''
                          )
                        : Promise.resolve(''),
                ]);

                return {
                    id: draft.id,
                    gmailDraftId: draft.gmailDraftId,
                    status: draft.status,
                    createdAt: draft.createdAt,
                    emailId: draft.emailId,
                    // Live from Gmail — never stored in DB
                    content,
                    emailSubject: emailMeta?.subject ?? null,
                    emailSender: emailMeta?.sender ?? null,
                };
            })
        );

        return NextResponse.json({ drafts: enriched });
    } catch (error) {
        console.error("Error fetching drafts:", error);
        return NextResponse.json(
            { error: "Failed to fetch drafts" },
            { status: 500 }
        );
    }
}
