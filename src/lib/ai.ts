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

export async function generateDraftReply(subject: string, body: string, sender: string, calendarContext?: string) {
    const content = `Sender: ${sender}\nSubject: ${subject}\nBody: ${body.slice(0, 2000)}`;
    const calPart = calendarContext ? `\n\nYour availability for context:\n${calendarContext}` : "";
    const prompt = `Draft a short, professional reply to this email. Keep it neutral, polite, and concise — 2-4 sentences maximum. Do not add a subject line or headers.${calPart}

Email Content:
${content}`;

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
