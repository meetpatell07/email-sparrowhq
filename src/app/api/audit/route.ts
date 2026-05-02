import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// Emails allowed to access the Trust Log.
// Add more as a comma-separated env var: TRUST_LOG_EMAILS=a@b.com,c@d.com
const TRUST_LOG_EMAILS = new Set(
    (process.env.TRUST_LOG_EMAILS ?? "meetpatel7026@gmail.com")
        .split(",")
        .map((e) => e.trim().toLowerCase())
);

export async function GET(request: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!TRUST_LOG_EMAILS.has(session.user.email.toLowerCase())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);

    const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.userId, session.user.id))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);

    return NextResponse.json({ logs });
}
