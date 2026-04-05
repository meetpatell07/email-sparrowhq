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

        const userId = session.user.id;

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

        // Truncate page content to keep prompt within model context limits
        const truncatedContent = pageContent
            ? pageContent.slice(0, 3000)
            : "(No page content extracted — rely on title and URL for context)";

        const prompt = `You are drafting a professional email on behalf of the user.

Page Context:
URL: ${pageUrl}
Title: ${pageTitle}
Content:
${truncatedContent}

User Intent: ${intent}
Recipient: ${recipientEmail}

Instructions:
- Write a concise, professional email (3–5 sentences in the body).
- Derive a short, relevant subject line from the intent and page context.
- No greeting or sign-off — just subject and body.
- Match formality to the context.

Return ONLY valid JSON with no explanation:
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
