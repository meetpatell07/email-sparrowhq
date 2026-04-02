import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { fetchAllDriveFiles } from "@/lib/drive";
import { redis } from "@/lib/redis";

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const cacheKey = `drive:${session.user.id}`;

        // Serve from Redis if available
        const cached = await redis.get(cacheKey);
        if (cached) {
            return NextResponse.json({ files: cached });
        }

        const files = await fetchAllDriveFiles(session.user.id);

        // Cache for 2 minutes
        await redis.set(cacheKey, files, { ex: 120 });

        return NextResponse.json({ files });
    } catch (error) {
        console.error("Error fetching drive files:", error);
        return NextResponse.json({ error: "Failed to fetch drive files" }, { status: 500 });
    }
}
