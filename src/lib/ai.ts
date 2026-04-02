import { z } from "zod";

const VALID_CATEGORIES = [
    "to_do", "follow_up", "scheduled",
    "finance", "work", "personal",
    "notification", "marketing",
] as const;

type Category = typeof VALID_CATEGORIES[number];

const classificationSchema = z.object({
    categories: z.array(z.enum(VALID_CATEGORIES)).min(1).max(2),
});

const invoiceSchema = z.object({
    isInvoice: z.boolean(),
    vendorName: z.string().nullable().optional(),
    amount: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
});

export async function callGroq(prompt: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("GROQ_API_KEY environment variable is not set");
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 512,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
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
- to_do: Email requires a reply or action from the user (includes drafting AI replies)
- follow_up: User has likely already replied and is waiting for a response (includes drafting AI replies)
- scheduled: Email is about meetings, calendar events, or scheduling

Context categories (what the email is about):
- finance: Invoices, receipts, billing, payments
- work: Clients, colleagues, business-related communication
- personal: Friends, family, non-work communication

Passive categories (low priority):
- notification: Automated system emails (OTP, password reset, alerts)
- marketing: Newsletters, promotions, sales outreach

## Instructions
- Return a JSON object only (no explanations).
- Always return an array of categories (minimum 1, maximum 2).
- Choose ALL categories that apply (multi-label classification).
- If unsure between "work" and "personal", prefer "work" if the tone is professional.
- Only use the exact category keys listed above.

Return ONLY: { "categories": ["category1"] } or { "categories": ["category1", "category2"] }

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
