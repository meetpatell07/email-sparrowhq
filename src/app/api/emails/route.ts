import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { fetchEmailsFromGmail } from "@/lib/gmail";
import { processIngestion } from "@/lib/ingest";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Run ingestion in background to process new emails (classification + auto-drafts)
    // Don't await to avoid blocking the response
    processIngestion(session.user.id).catch((err) => {
      console.error("Background ingestion error:", err);
    });

    const emails = await fetchEmailsFromGmail(session.user.id, limit);

    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
