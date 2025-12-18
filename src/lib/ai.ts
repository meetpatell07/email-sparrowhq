import { z } from "zod";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";
const MODEL = "gemini-3-flash-preview:cloud";

// Schemas
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

async function callOllama(prompt: string): Promise<string> {
    const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: MODEL,
            prompt,
            stream: false,
        }),
    });

    if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || "";
}

async function parseJSONObject(text: string) {
    try {
        return JSON.parse(text);
    } catch (e) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            return JSON.parse(match[0]);
        }
        throw e;
    }
}

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

    const text = await callOllama(prompt);
    const parsedData = await parseJSONObject(text);
    const validated = classificationSchema.parse(parsedData);
    return validated.category;
}

export async function extractInvoiceData(subject: string, body: string) {
    const content = `Subject: ${subject}\nBody: ${body.slice(0, 3000)}`;
    const prompt = `Analyze this email. If it is an invoice, extract the vendor name, amount, currency, and due date. If not, set isInvoice to false.

Return ONLY a JSON object matching this schema:
{
    "isInvoice": boolean,
    "vendorName": string or null,
    "amount": number or null,
    "currency": string or null,
    "dueDate": string or null (ISO format)
}

Email Content:
${content}`;

    const text = await callOllama(prompt);
    const parsedData = await parseJSONObject(text);
    return invoiceSchema.parse(parsedData);
}

export async function generateDraftReply(subject: string, body: string, sender: string) {
    const content = `Sender: ${sender}\nSubject: ${subject}\nBody: ${body.slice(0, 2000)}`;
    const prompt = `Draft a short, professional reply to this email. Keep it neutral and polite. 2-4 sentences max.

Email Content:
${content}`;

    return await callOllama(prompt);
}
