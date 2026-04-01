import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { drafts, emails } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch drafts with their associated email info
        const userDrafts = await db
            .select({
                id: drafts.id,
                gmailDraftId: drafts.gmailDraftId,
                content: drafts.content,
                status: drafts.status,
                createdAt: drafts.createdAt,
                emailId: drafts.emailId,
                emailSubject: emails.subject,
                emailSender: emails.sender,
                emailSnippet: emails.snippet,
            })
            .from(drafts)
            .innerJoin(emails, eq(drafts.emailId, emails.id))
            .where(eq(emails.userId, session.user.id))
            .orderBy(drafts.createdAt);

        return NextResponse.json({ drafts: userDrafts });
    } catch (error) {
        console.error("Error fetching drafts:", error);
        return NextResponse.json(
            { error: "Failed to fetch drafts" },
            { status: 500 }
        );
    }
}
