import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { qstash } from "@/lib/qstash";

// Pub/Sub push endpoint.
// Configure your Pub/Sub push subscription URL as:
//   https://yourdomain.com/api/gmail/webhook?token=<PUBSUB_WEBHOOK_SECRET>
//
// ALWAYS return 200 — non-200 causes Pub/Sub to retry with exponential backoff.
// Hand off to QStash immediately; let QStash handle retries for actual processing.

export async function POST(req: NextRequest) {
    // Validate shared secret in query param
    const token = req.nextUrl.searchParams.get("token");
    if (token !== process.env.PUBSUB_WEBHOOK_SECRET) {
        // Return 200 anyway so Pub/Sub doesn't retry; just ignore the message
        return NextResponse.json({ ok: true });
    }

    let body: { message?: { data?: string } };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ ok: true });
    }

    const rawData = body.message?.data;
    if (!rawData) return NextResponse.json({ ok: true });

    let notification: { emailAddress?: string; historyId?: string };
    try {
        notification = JSON.parse(Buffer.from(rawData, "base64").toString("utf-8"));
    } catch {
        return NextResponse.json({ ok: true });
    }

    const { emailAddress, historyId } = notification;
    if (!emailAddress || !historyId) return NextResponse.json({ ok: true });

    // Look up user by Gmail address
    const userRecord = await db.select({ id: user.id })
        .from(user)
        .where(eq(user.email, emailAddress))
        .limit(1);

    if (!userRecord.length) return NextResponse.json({ ok: true });

    const appUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

    // Publish to QStash — it will retry up to 3× on failure
    await qstash.publishJSON({
        url: `${appUrl}/api/ingest/process-history`,
        body: { userId: userRecord[0].id, historyId: parseInt(historyId) },
        retries: 3,
    });

    return NextResponse.json({ ok: true });
}
