import { NextResponse } from "next/server";
import { account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ingestRatelimit } from "@/lib/ratelimit";
import { qstash } from "@/lib/qstash";
import { listNewEmailIds, processIngestion } from "@/lib/ingest";

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    const isDev = process.env.NODE_ENV !== 'production';

    if (!isDev && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // Rate limit: 1 ingest trigger per minute globally
    const { success } = await ingestRatelimit.limit("global");
    if (!success) {
        return NextResponse.json({ error: "Rate limit exceeded — try again in a minute." }, { status: 429 });
    }

    // In development QStash cannot reach localhost, so process directly.
    // In production, queue each message to QStash for reliable delivery + retries.
    if (isDev) {
        const results = await processIngestion();
        return NextResponse.json({ success: true, mode: "direct", processed: results.length, results });
    }

    const googleAccounts = await db
        .select()
        .from(account)
        .where(eq(account.providerId, 'google'));

    const appUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    let queued = 0;

    for (const acc of googleAccounts) {
        try {
            const messageIds = await listNewEmailIds(acc.userId);

            for (const messageId of messageIds) {
                await qstash.publishJSON({
                    url: `${appUrl}/api/ingest/process`,
                    body: { userId: acc.userId, messageId },
                    retries: 3,
                });
                queued++;
            }
        } catch (e) {
            console.error(`Failed to queue emails for user ${acc.userId}:`, e);
        }
    }

    return NextResponse.json({ success: true, mode: "qstash", queued });
}
