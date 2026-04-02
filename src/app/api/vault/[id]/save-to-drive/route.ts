import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attachments, emails } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { s3, R2_BUCKET_NAME } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getGoogleDriveClient } from "@/lib/drive";
import { Readable } from "stream";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Fetch attachment and verify ownership
    const rows = await db
        .select({
            id: attachments.id,
            filename: attachments.filename,
            contentType: attachments.contentType,
            r2Key: attachments.r2Key,
            driveFileId: attachments.driveFileId,
        })
        .from(attachments)
        .innerJoin(emails, eq(attachments.emailId, emails.id))
        .where(and(eq(attachments.id, id), eq(emails.userId, session.user.id)))
        .limit(1);

    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const att = rows[0];

    if (att.driveFileId) {
        return NextResponse.json({ error: "Already saved to Drive" }, { status: 409 });
    }

    // Download from R2
    const r2Res = await s3.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: att.r2Key }));
    if (!r2Res.Body) return NextResponse.json({ error: "File not found in storage" }, { status: 500 });

    const chunks: Buffer[] = [];
    for await (const chunk of r2Res.Body as Readable) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const fileBuffer = Buffer.concat(chunks);

    // Upload to Google Drive
    const drive = await getGoogleDriveClient(session.user.id);
    const { Readable: NodeReadable } = await import("stream");
    const stream = NodeReadable.from(fileBuffer);

    const driveRes = await drive.files.create({
        requestBody: {
            name: att.filename,
            mimeType: att.contentType ?? "application/octet-stream",
        },
        media: {
            mimeType: att.contentType ?? "application/octet-stream",
            body: stream,
        },
        fields: "id,webViewLink",
    });

    const driveFileId = driveRes.data.id!;
    const driveWebViewLink = driveRes.data.webViewLink!;

    // Persist Drive reference
    await db
        .update(attachments)
        .set({ driveFileId, driveWebViewLink })
        .where(eq(attachments.id, id));

    return NextResponse.json({ driveFileId, driveWebViewLink });
}
