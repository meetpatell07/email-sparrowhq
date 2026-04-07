import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
