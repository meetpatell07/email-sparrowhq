import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { callGroq } from "@/lib/ai";
import { createGmailDraft } from "@/lib/gmail";
import { db } from "@/lib/db";
import { drafts } from "@/lib/db/schema";
import { extensionDraftRatelimit } from "@/lib/ratelimit";

// Reflect the chrome-extension:// origin back so credentials work.
// Must be exact origin (not *) when credentials: 'include' is used.
function corsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get("origin") ?? "";
    if (!origin.startsWith("chrome-extension://")) return {};
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

// Handle CORS preflight
export async function OPTIONS(request: Request) {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
    const cors = corsHeaders(request);

    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });
        }

        const userId    = session.user.id;
        const senderName = session.user.name || session.user.email;

        // Rate limit: 10 drafts per user per hour
        const { success } = await extensionDraftRatelimit.limit(userId);
        if (!success) {
            return NextResponse.json(
                { error: "Rate limit exceeded. You can generate up to 10 drafts per hour." },
                { status: 429, headers: cors }
            );
        }

        const body = await request.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: cors });
        }

        const { pageUrl, pageTitle, pageContent, recipientEmail, intent } = body as {
            pageUrl?: string;
            pageTitle?: string;
            pageContent?: string;
            recipientEmail?: string;
            intent?: string;
        };

        if (!pageUrl || !pageTitle || !recipientEmail || !intent) {
            return NextResponse.json(
                { error: "Missing required fields: pageUrl, pageTitle, recipientEmail, intent" },
                { status: 400, headers: cors }
            );
        }

        // Use up to 4000 chars of page content (content script already truncates to 5000 words)
        const truncatedContent = pageContent
            ? pageContent.slice(0, 4000)
            : "(No page content — use the page title and URL for context)";

        const prompt = `You are writing a professional email on behalf of ${senderName}.

== PAGE CONTEXT ==
URL: ${pageUrl}
Title: ${pageTitle}

${truncatedContent}
== END PAGE CONTEXT ==

Sender: ${senderName}
Recipient email: ${recipientEmail}
Intent: ${intent}

== INSTRUCTIONS ==
Write a complete, properly structured email. The body MUST follow this exact structure with blank lines between each section:

1. Greeting line — "Hi," or "Dear Sir/Madam," (use "Hi," if the context is informal, "Dear Sir/Madam," if formal)
2. Blank line
3. Introduction paragraph — one sentence introducing who you are and why you are writing
4. Blank line
5. Main body paragraph(s) — 2–4 sentences expanding on the intent, referencing specific details from the page context
6. Blank line
7. Closing paragraph — one sentence with a clear call to action or expression of interest
8. Blank line
9. Sign-off — "Best regards," on its own line, then "${senderName}" on the next line

Rules:
- Use \\n\\n between every section (double newline = blank line)
- Subject line must be specific and derived from the page context and intent (not generic)
- Do NOT include the subject line inside the body
- Match formality to context (job applications → formal, pricing inquiry → semi-formal)

Return ONLY valid JSON (no markdown, no explanation):
{ "subject": "...", "body": "..." }`;

        const raw = await callGroq(prompt);

        // Extract JSON from model output
        let subject: string;
        let emailBody: string;
        try {
            const match = raw.match(/\{[\s\S]*\}/);
            if (!match) throw new Error("No JSON found");
            const parsed = JSON.parse(match[0]);
            subject = parsed.subject?.trim() || `Re: ${pageTitle}`;
            emailBody = parsed.body?.trim() || raw.trim();
        } catch {
            // Fallback: treat entire output as body
            subject = `Re: ${pageTitle}`;
            emailBody = raw.trim();
        }

        const gmailDraftId = await createGmailDraft(
            userId,
            recipientEmail,
            subject,
            emailBody
        );

        const [draft] = await db
            .insert(drafts)
            .values({
                emailId: null,
                gmailDraftId,
                status: "pending_approval",
                source: "extension",
            })
            .returning({ id: drafts.id });

        return NextResponse.json(
            {
                success: true,
                draftId: draft.id,
                gmailDraftId,
                subject,
                body: emailBody,
                gmailDraftsUrl: "https://mail.google.com/mail/#drafts",
            },
            { headers: cors }
        );
    } catch (error: any) {
        console.error("[ext/draft] Error:", error?.message ?? error);
        return NextResponse.json(
            { error: "Failed to generate draft" },
            { status: 500, headers: cors }
        );
    }
}
