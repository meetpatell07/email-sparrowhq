import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { account, user } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getGmailClient } from "@/lib/gmail";
import { buildRawEmail } from "@/lib/gmail-draft";

interface Transcript {
  role: "user" | "assistant";
  content: string;
}

interface Lead {
  name: string;
  email: string;
  pageUrl: string;
  question: string;
  score: "hot" | "warm" | "cold";
  transcript: Transcript[];
}

interface RequestBody {
  ownerEmail: string;
  lead: Lead;
}

export async function POST(req: NextRequest) {
  if (req.headers.get("x-internal-secret") !== process.env.INTERNAL_API_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { ownerEmail, lead } = body;
  if (!ownerEmail || !lead) {
    return Response.json({ error: "Missing ownerEmail or lead" }, { status: 400 });
  }

  // Look up owner user record
  const userRows = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.email, ownerEmail))
    .limit(1);

  if (!userRows.length) {
    return Response.json({ error: "Owner Gmail not connected" }, { status: 404 });
  }

  const { id: userId, name: ownerName } = userRows[0];

  // Verify Google account exists
  const accountRows = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "google")))
    .limit(1);

  if (!accountRows.length) {
    return Response.json({ error: "Owner Gmail not connected" }, { status: 404 });
  }

  // Build email content
  const truncatedQuestion =
    lead.question.length > 60 ? lead.question.slice(0, 60) + "…" : lead.question;
  const subject = `Following up on your inquiry — ${truncatedQuestion}`;

  const transcriptText = lead.transcript
    .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.content}`)
    .join("\n");

  const bodyText = [
    `Hi ${lead.name},`,
    ``,
    `Thanks for reaching out on ${lead.pageUrl}.`,
    ``,
    `You asked about: "${lead.question}"`,
    ``,
    ``,
    ``,
    ``,
    `── Conversation transcript ──`,
    transcriptText,
    ``,
    `Best regards,`,
    ownerName,
  ].join("\n");

  const transcriptHtml = lead.transcript
    .map(
      (m) =>
        `<p><strong>${m.role === "user" ? "Visitor" : "Assistant"}:</strong> ${m.content}</p>`
    )
    .join("\n");

  const bodyHtml = `
<p>Hi ${lead.name},</p>
<p>Thanks for reaching out on <a href="${lead.pageUrl}">${lead.pageUrl}</a>.</p>
<p>You asked about: &ldquo;${lead.question}&rdquo;</p>
<br/><br/><br/>
<hr/>
<p><strong>── Conversation transcript ──</strong></p>
${transcriptHtml}
<p>Best regards,<br/>${ownerName}</p>
`.trim();

  // Get Gmail client (handles token refresh automatically)
  let gmail;
  try {
    gmail = await getGmailClient(userId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: "Owner Gmail not connected", detail: msg }, { status: 404 });
  }

  const raw = buildRawEmail({
    to: lead.email,
    subject,
    bodyText,
    bodyHtml,
  });

  let draftResponse;
  try {
    draftResponse = await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: { raw },
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: "Gmail API error", detail: msg }, { status: 502 });
  }

  const draftId = draftResponse.data.id;
  if (!draftId) {
    return Response.json({ error: "Gmail API returned no draft ID" }, { status: 502 });
  }

  return Response.json({
    success: true,
    draftId,
    gmailDraftUrl: `https://mail.google.com/mail/#drafts/${draftId}`,
  });
}
