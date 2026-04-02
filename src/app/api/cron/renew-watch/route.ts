import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { setupGmailWatch } from "@/lib/gmail";

// Renew Gmail Pub/Sub watch for all Google-linked users.
// Gmail watch expires every 7 days — run this as a weekly cron.
// Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const googleAccounts = await db.select({ userId: account.userId })
        .from(account)
        .where(eq(account.providerId, "google"));

    let renewed = 0;
    const errors: string[] = [];

    for (const { userId } of googleAccounts) {
        try {
            await setupGmailWatch(userId);
            renewed++;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`Failed to renew watch for user ${userId}:`, msg);
            errors.push(`${userId}: ${msg}`);
        }
    }

    return NextResponse.json({ renewed, errors });
}
