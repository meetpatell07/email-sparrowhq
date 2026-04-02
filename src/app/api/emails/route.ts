import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(request: Request) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const cacheKey = `emails:${session.user.id}:${limit}`;

    // Serve from Redis if available
    const cached = await redis.get(cacheKey);
    if (cached) {
      // Still check watch health in the background even on cache hit —
      // the cache TTL is 60 s so this won't spam the Gmail API.
      const { ensureGmailWatch } = await import("@/lib/gmail");
      ensureGmailWatch(session.user.id).catch((err) =>
        console.error("[watch] ensure failed:", err)
      );
      return NextResponse.json({ emails: cached });
    }

    const { fetchEmailsFromGmail, ensureGmailWatch } = await import("@/lib/gmail");

    // Ensure Gmail Pub/Sub watch is active — fire-and-forget so it never
    // blocks the email response. On first login this registers the watch;
    // on subsequent calls it's a cheap DB read that no-ops unless expiring.
    ensureGmailWatch(session.user.id).catch((err) =>
      console.error("[watch] ensure failed:", err)
    );

    const emails = await fetchEmailsFromGmail(session.user.id, limit);

    // Cache for 60 seconds
    await redis.set(cacheKey, emails, { ex: 60 });

    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
