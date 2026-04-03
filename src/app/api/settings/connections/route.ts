import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db
        .select({
            id: account.id,
            accountId: account.accountId,
            providerId: account.providerId,
            scope: account.scope,
            hasAccessToken: account.accessToken,
            accessTokenExpiresAt: account.accessTokenExpiresAt,
            gmailHistoryId: account.gmailHistoryId,
            gmailWatchExpiration: account.gmailWatchExpiration,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        })
        .from(account)
        .where(eq(account.userId, session.user.id));

    // Never expose raw token values — just signal whether they exist
    const connections = rows.map((r) => ({
        id: r.id,
        accountId: r.accountId,
        providerId: r.providerId,
        scope: r.scope,
        isConnected: !!r.hasAccessToken,
        accessTokenExpiresAt: r.accessTokenExpiresAt,
        gmailWatchExpiration: r.gmailWatchExpiration,
        gmailHistoryId: r.gmailHistoryId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    }));

    return NextResponse.json({ connections });
}
