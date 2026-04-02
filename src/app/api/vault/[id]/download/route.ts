import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attachments, emails } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { s3, R2_BUCKET_NAME } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Verify ownership via join
    const rows = await db
        .select({ r2Key: attachments.r2Key, filename: attachments.filename })
        .from(attachments)
        .innerJoin(emails, eq(attachments.emailId, emails.id))
        .where(and(eq(attachments.id, id), eq(emails.userId, session.user.id)))
        .limit(1);

    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { r2Key, filename } = rows[0];

    const url = await getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: r2Key,
            ResponseContentDisposition: `attachment; filename="${filename}"`,
        }),
        { expiresIn: 300 } // 5 minutes
    );

    return NextResponse.json({ url });
}
