import { NextRequest, NextResponse } from "next/server";
import { qstashReceiver } from "@/lib/qstash";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getGmailClient } from "@/lib/gmail";
import { processSingleEmail } from "@/lib/ingest";

// QStash worker: fetches Gmail history since the last known historyId,
// deduplicates via Redis, and processes each new message.
export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const signature = req.headers.get("upstash-signature") ?? "";

    const isValid = await qstashReceiver.verify({ signature, body: rawBody });
    if (!isValid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: { userId: string; historyId: number };
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { userId, historyId } = payload;
    if (!userId || !historyId) {
        return NextResponse.json({ error: "Missing userId or historyId" }, { status: 400 });
    }

    // Resolve the starting cursor: Redis first, fall back to DB
    const cursorKey = `history:${userId}`;
    let startHistoryId = await redis.get<number>(cursorKey);

    if (!startHistoryId) {
        const dbAccount = await db.select({ gmailHistoryId: account.gmailHistoryId })
            .from(account)
            .where(and(eq(account.userId, userId), eq(account.providerId, "google")))
            .limit(1);
        startHistoryId = dbAccount[0]?.gmailHistoryId ? parseInt(dbAccount[0].gmailHistoryId) : historyId;
    }

    // Fetch history since cursor
    const gmail = await getGmailClient(userId);
    let historyRes;
    try {
        historyRes = await gmail.users.history.list({
            userId: "me",
            startHistoryId: String(startHistoryId),
            historyTypes: ["messageAdded"],
            labelId: "INBOX",
        });
    } catch (err: unknown) {
        // historyId may have expired (> 7 days old) — log and advance cursor
        console.error(`History fetch failed for user ${userId}:`, err);
        await redis.set(cursorKey, historyId, { ex: 60 * 60 * 24 * 30 });
        return NextResponse.json({ error: "History expired, cursor advanced" }, { status: 200 });
    }

    const messageIds = (historyRes.data.history ?? [])
        .flatMap((h) => h.messagesAdded ?? [])
        .map((m) => m.message?.id)
        .filter(Boolean) as string[];

    // Advance cursor before processing so we don't re-process if something below fails
    await redis.set(cursorKey, historyId, { ex: 60 * 60 * 24 * 30 });

    // Also persist to DB as a durable fallback (in case Redis evicts)
    await db.update(account)
        .set({ gmailHistoryId: String(historyId) })
        .where(and(eq(account.userId, userId), eq(account.providerId, "google")));

    if (!messageIds.length) {
        return NextResponse.json({ processed: 0 });
    }

    // Dedup + process
    let processed = 0;
    for (const messageId of messageIds) {
        const dedupKey = `processed:${messageId}`;
        const alreadyDone = await redis.get(dedupKey);
        if (alreadyDone) continue;

        // Mark as in-flight before processing to prevent concurrent duplicates
        await redis.set(dedupKey, "1", { ex: 60 * 60 * 24 * 7 });

        try {
            await processSingleEmail(userId, messageId);
            processed++;
        } catch (err) {
            console.error(`Failed to process message ${messageId}:`, err);
            // Delete dedup key so QStash retry will attempt it again
            await redis.del(dedupKey);
        }
    }

    return NextResponse.json({ processed });
}
