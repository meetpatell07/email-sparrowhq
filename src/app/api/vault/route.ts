import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attachments, emails } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db
        .select({
            id: attachments.id,
            filename: attachments.filename,
            contentType: attachments.contentType,
            size: attachments.size,
            r2Key: attachments.r2Key,
            driveFileId: attachments.driveFileId,
            driveWebViewLink: attachments.driveWebViewLink,
            createdAt: attachments.createdAt,
            emailId: emails.id,
            emailGmailId: emails.gmailId,
            // emailSubject / emailSender / emailSnippet removed — no longer stored in DB.
            // Use emailGmailId to fetch email metadata live from Gmail API if needed.
            emailReceivedAt: emails.receivedAt,
            emailCategories: emails.categories,
        })
        .from(attachments)
        .innerJoin(emails, eq(attachments.emailId, emails.id))
        .where(eq(emails.userId, session.user.id))
        .orderBy(desc(attachments.createdAt));

    return NextResponse.json({ attachments: rows });
}
