import { z } from "zod";

const VALID_CATEGORIES = [
    "important", "follow_up", "scheduled",
    "finance", "personal",
    "notification", "marketing",
] as const;

type Category = typeof VALID_CATEGORIES[number];

const classificationSchema = z.object({
    // Accept any strings from the model, strip unrecognised values (e.g. stale "work"/"to_do"),
    // then enforce at least one valid result. Transform runs after the string[] parse, so unknown
    // categories are silently dropped instead of throwing a ZodError.
    categories: z.array(z.string())
        .transform(arr =>
            arr.filter((c): c is Category =>
                (VALID_CATEGORIES as readonly string[]).includes(c)
            ).slice(0, 1)
        )
        .pipe(z.array(z.enum(VALID_CATEGORIES)).min(1)),
});

const invoiceSchema = z.object({
    isInvoice: z.boolean(),
    vendorName: z.string().nullable().optional(),
    amount: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
});

export async function callGroq(prompt: string): Promise<string> {
    const baseUrl = (process.env.OLLAMA_URL ?? "http://localhost:11434").replace(/\/$/, "");
    const model   = process.env.OLLAMA_MODEL ?? "llama3.2";

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            stream: false,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
}

function parseJSONObject(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error(`Could not parse JSON from: ${text.slice(0, 200)}`);
    }
}

// ─── Public API ────────────────────────────────────────────────────────────
export async function classifyEmail(subject: string, snippet: string, body?: string): Promise<Category[]> {
    const content = `Subject: ${subject}\nSnippet: ${snippet}\nBody: ${body?.slice(0, 1000) || ""}`;
    const prompt = `Analyze the email and assign one or more categories based on its content.

## Categories

Action categories (what the user needs to do):
- important: Email requires a reply or action from the user (includes drafting AI replies)
- follow_up: User has likely already replied and is waiting for a response (includes drafting AI replies)
- scheduled: Email is about meetings, calendar events, or scheduling

Context categories (what the email is about):
- finance: Invoices, receipts, billing, payments
- personal: Friends, family, non-work communication

Passive categories (low priority):
- notification: Automated system emails (OTP, password reset, alerts)
- marketing: Newsletters, promotions, sales outreach

## Instructions
- Return a JSON object only (no explanations).
- Always return exactly one category (the best match).
- Only use the exact category keys listed above.

Return ONLY: { "categories": ["category1"] }

Email Content:
${content}`;

    const text = await callGroq(prompt);
    const parsed = parseJSONObject(text);
    const validated = classificationSchema.parse(parsed);
    return validated.categories;
}

export async function extractInvoiceData(subject: string, body: string) {
    const content = `Subject: ${subject}\nBody: ${body.slice(0, 3000)}`;
    const prompt = `Analyze this email. If it is an invoice, extract the vendor name, amount, currency, and due date. If not, set isInvoice to false.

Return ONLY a JSON object:
{
  "isInvoice": boolean,
  "vendorName": string or null,
  "amount": number or null,
  "currency": string or null,
  "dueDate": string or null (ISO format)
}

Email Content:
${content}`;

    const text = await callGroq(prompt);
    const parsed = parseJSONObject(text);
    return invoiceSchema.parse(parsed);
}

// Extract a usable first name from a Gmail From header.
// "John Smith <john@example.com>" → "John"
// "john@example.com" → "John"
function extractSenderFirstName(from: string): string {
    const displayMatch = from.match(/^"?([^"<@\n]+)"?\s*</);
    if (displayMatch) {
        const firstName = displayMatch[1].trim().split(/\s+/)[0];
        if (firstName) return firstName;
    }
    const emailPrefix = from.match(/([^@<\s]+)@/);
    if (emailPrefix) {
        const name = emailPrefix[1].replace(/[._-]/g, " ").split(/\s+/)[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return "there";
}

// Decide whether an incoming email actually warrants an auto-draft reply.
// Returns false for automated alerts, FYI-only emails, no-reply senders, etc.
export async function shouldGenerateDraft(
    subject: string,
    body: string,
    sender: string
): Promise<boolean> {
    const content = `From: ${sender}\nSubject: ${subject}\nBody: ${body.slice(0, 1500)}`;
    const prompt = `Analyze this email and decide whether it genuinely requires a human reply.

Emails that NEED a draft reply:
- A person asking a direct question expecting your answer
- A request: meeting invite, help, information, approval, quote
- A follow-up from someone waiting on your response
- Professional/personal correspondence addressed directly to you

Emails that do NOT need a draft reply:
- Automated notifications, system alerts, or monitoring emails
- Order confirmations, shipping updates, receipts, invoices
- Password resets, OTPs, verification codes
- Newsletters or marketing, even if relevant to you
- Emails from noreply@, do-not-reply@, or automated senders
- Mailing list broadcasts or mass announcements
- Calendar invites handled by calendar apps
- FYI-only emails where a reply is clearly not expected

Email:
${content}

Return ONLY valid JSON: { "needsDraft": true } or { "needsDraft": false }`;

    try {
        const text = await callGroq(prompt);
        const parsed = parseJSONObject(text) as { needsDraft?: boolean };
        return parsed.needsDraft === true;
    } catch {
        // Default to drafting on failure — better to over-draft than miss an important reply
        return true;
    }
}

export async function generateDraftReply(
    subject: string,
    body: string,
    sender: string,
    userName: string,
    calendarContext?: string
) {
    const senderFirstName = extractSenderFirstName(sender);
    const emailContent = `From: ${sender}\nSubject: ${subject}\nBody: ${body.slice(0, 2500)}`;

    const calSection = calendarContext
        ? `\n\nCalendar context (your availability):\n${calendarContext}\n\nIf the email is about scheduling or availability, propose specific free time slots naturally (e.g. "I'm free Tuesday at 2 pm or Wednesday between 10–12"). Ignore this section if scheduling is not relevant.`
        : "";

    const prompt = `You are drafting a professional email reply on behalf of ${userName}.

Email you are replying to:
${emailContent}${calSection}

Write a complete, properly structured reply. Use this exact structure with a blank line between each section:

1. Greeting — "Hi ${senderFirstName}," (use "Dear ${senderFirstName}," if the email is very formal)
2. Blank line
3. Opening sentence — one concise sentence acknowledging what they wrote about (no generic openers like "I hope this email finds you well")
4. Blank line
5. Main reply — 2–3 sentences directly addressing their question, request, or message. Be specific — reference actual details from their email. Do not be vague or generic.
6. Blank line
7. Closing sentence — one natural sentence (e.g. "Let me know if you have any questions." or "Looking forward to hearing from you.")
8. Blank line
9. Sign-off — "Best regards," on its own line, then "${userName}" on the next line

Rules:
- Use \\n\\n between every section
- Match the tone of their email: formal stays formal, casual stays casual
- Do NOT invent facts — only reference what is explicitly in their email
- Do NOT include a subject line in the output
- Return only the plain email body text, nothing else`;

    return callGroq(prompt);
}

export async function generateDraftFromFile(fileContext: string, instructions: string, recipient: string) {
    const prompt = `You are an AI generating an email draft for the user. 
The user wants to send an email to: ${recipient}.
User Instructions: ${instructions}

Here is the textual content of the associated Google Drive document they are referencing:
---
${fileContext.slice(0, 3000)}
---

Draft a professional email based on the instructions, summarizing or referencing the document appropriately. Keep it concise. Do not include a subject line or headers in the output, just the body of the email.`;

    return callGroq(prompt);
}
