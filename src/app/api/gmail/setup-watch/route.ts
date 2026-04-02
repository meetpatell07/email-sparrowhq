import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { setupGmailWatch } from "@/lib/gmail";

// Call this once after a user connects their Google account.
// Also used as a manual trigger if the watch needs to be re-established.
export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await setupGmailWatch(session.user.id);
        return NextResponse.json({ ok: true, ...result });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("setup-watch failed:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
