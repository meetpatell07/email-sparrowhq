import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// Always cache and serve the latest 20 emails per user.
// Key is userId-scoped (no limit suffix) so ingest.ts can invalidate with a single del.
const CACHE_LIMIT = 20;
const CACHE_TTL_SECONDS = 300; // 5 minutes

export async function GET() {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `emails:${session.user.id}`;

    // Serve from Redis if available — background-check watch health on cache hit
    const cached = await redis.get(cacheKey);
    if (cached) {
      const { ensureGmailWatch } = await import("@/lib/gmail");
      ensureGmailWatch(session.user.id).catch((err) =>
        console.error("[watch] ensure failed:", err)
      );
      return NextResponse.json({ emails: cached });
    }

    const { fetchEmailsFromGmail, ensureGmailWatch } = await import("@/lib/gmail");

    // Ensure Gmail Pub/Sub watch is active — fire-and-forget, never blocks response
    ensureGmailWatch(session.user.id).catch((err) =>
      console.error("[watch] ensure failed:", err)
    );

    const emails = await fetchEmailsFromGmail(session.user.id, CACHE_LIMIT);

    // Cache the enriched list (Gmail content + DB categories) for 5 minutes.
    // Invalidated immediately when a new email is processed by ingest.ts.
    await redis.set(cacheKey, emails, { ex: CACHE_TTL_SECONDS });

    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
