
import { generateObject, generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Schemas
const classificationSchema = z.object({
    category: z.enum(["personal", "invoice", "client", "urgent"]),
});

const invoiceSchema = z.object({
    isInvoice: z.boolean(),
    vendorName: z.string().optional(),
    amount: z.number().optional(),
    currency: z.string().optional(),
    dueDate: z.string().optional(), // ISO date string
});

export async function classifyEmail(subject: string, snippet: string, body?: string) {
    const content = `Subject: ${subject}\nSnippet: ${snippet}\nBody: ${body?.slice(0, 1000) || ""}`;

    const { object } = await generateObject({
        model: google("gemini-1.5-flash"),
        schema: classificationSchema,
        prompt: `Classify the following email into one of these categories: personal, invoice, client, urgent.\n\n${content}`,
    });

    return object.category;
}

export async function extractInvoiceData(subject: string, body: string) {
    const content = `Subject: ${subject}\nBody: ${body.slice(0, 3000)}`;

    const { object } = await generateObject({
        model: google("gemini-1.5-flash"),
        schema: invoiceSchema,
        prompt: `Analyze this email. If it is an invoice, extract the vendor name, amount, currency, and due date. If not, set isInvoice to false.\n\n${content}`,
    });

    return object;
}

export async function generateDraftReply(subject: string, body: string, sender: string) {
    const content = `Sender: ${sender}\nSubject: ${subject}\nBody: ${body.slice(0, 2000)}`;

    const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt: `Draft a short, professional reply to this urgent email. Keep it neutral and polite. 2-4 sentences max.\n\n${content}`,
    });

    return text;
}
