import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attachments, emails } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { callGroq } from "@/lib/ai";
import { fetchEmailMetadataById } from "@/lib/gmail";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Fetch only non-content fields from DB — subject/sender/snippet not stored
    const rows = await db
        .select({
            filename: attachments.filename,
            contentType: attachments.contentType,
            emailGmailId: emails.gmailId,
        })
        .from(attachments)
        .innerJoin(emails, eq(attachments.emailId, emails.id))
        .where(and(eq(attachments.id, id), eq(emails.userId, session.user.id)))
        .limit(1);

    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { filename, emailGmailId } = rows[0];

    // Fetch subject, sender, snippet live from Gmail — never stored in DB
    const meta = await fetchEmailMetadataById(session.user.id, emailGmailId);

    const prompt = `Draft a short, professional follow-up email related to an attachment.

Email Context:
- From: ${meta.sender || "Unknown sender"}
- Subject: ${meta.subject || "(No subject)"}
- Snippet: ${meta.snippet || ""}
- Attachment: ${filename}

Write a concise follow-up reply (2–4 sentences) acknowledging the attachment and indicating next steps or requesting clarification if needed. Do not include a subject line or headers.`;

    const draft = await callGroq(prompt);

    return NextResponse.json({ draft, subject: `Re: ${meta.subject || "your email"}` });
}
