import { z } from "zod";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.1-8b-instant";

// ─── Schemas ───────────────────────────────────────────────────────────────
const classificationSchema = z.object({
    category: z.enum(["personal", "invoice", "client", "urgent", "marketing", "notification"]),
});

const invoiceSchema = z.object({
    isInvoice: z.boolean(),
    vendorName: z.string().nullable().optional(),
    amount: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
});

// ─── Core helper ───────────────────────────────────────────────────────────
async function callGroq(prompt: string): Promise<string> {
    const { text } = await generateText({
        model: groq(MODEL),
        prompt,
        maxOutputTokens: 512,
    });
    return text;
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
export async function classifyEmail(subject: string, snippet: string, body?: string) {
    const content = `Subject: ${subject}\nSnippet: ${snippet}\nBody: ${body?.slice(0, 1000) || ""}`;
    const prompt = `Classify the following email into exactly one of these categories:
- personal: One-on-one personal messages or non-business correspondence.
- invoice: Bills, receipts, or payment-related documents.
- client: Emails from or related to professional clients or work projects.
- urgent: Messages requiring immediate attention or expressing high priority.
- marketing: Newsletters, promotions, or generic marketing content.
- notification: Automated system updates, social media alerts, or login notifications.

Return ONLY a JSON object: { "category": "one_of_the_above" }

Email Content:
${content}`;

    const text = await callGroq(prompt);
    const parsed = parseJSONObject(text);
    const validated = classificationSchema.parse(parsed);
    return validated.category;
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
