import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { fetchRecentDriveFiles } from "@/lib/drive";

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const files = await fetchRecentDriveFiles(session.user.id);
        return NextResponse.json({ files });
    } catch (error) {
        console.error("Error fetching drive files:", error);
        return NextResponse.json({ error: "Failed to fetch drive files" }, { status: 500 });
    }
}
