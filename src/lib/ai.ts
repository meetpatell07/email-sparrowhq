import { z } from "zod";

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

export async function callGemini(prompt: string): Promise<string> {
    const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 512 }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
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

    const text = await callGemini(prompt);
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

    const text = await callGemini(prompt);
    const parsed = parseJSONObject(text);
    return invoiceSchema.parse(parsed);
}

export async function generateDraftReply(subject: string, body: string, sender: string, calendarContext?: string) {
    const content = `Sender: ${sender}\nSubject: ${subject}\nBody: ${body.slice(0, 2000)}`;
    const calPart = calendarContext ? `\n\nYour availability for context:\n${calendarContext}` : "";
    const prompt = `Draft a short, professional reply to this email. Keep it neutral, polite, and concise — 2-4 sentences maximum. Do not add a subject line or headers.${calPart}

Email Content:
${content}`;

    return callGemini(prompt);
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

    return callGemini(prompt);
}
