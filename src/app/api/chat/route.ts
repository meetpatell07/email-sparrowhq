import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emails, drafts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateDraftReply } from "@/lib/ai";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";
const MODEL = "gemini-3-flash-preview:cloud";

async function callOllama(prompt: string): Promise<string> {
    const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, prompt, stream: false }),
    });

    if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "";
}

interface CommandContext {
    userId: string;
    userEmail: string;
}

async function parseCommand(message: string): Promise<{
    intent: "check_calendar" | "check_availability" | "draft_email" | "create_event" | "delete_event" | "list_emails" | "unknown";
    params: Record<string, string>;
}> {
    const lower = message.toLowerCase();

    if (lower.includes("calendar") && (lower.includes("today") || lower.includes("schedule") || lower.includes("what"))) {
        return { intent: "check_calendar", params: { date: "today" } };
    }
    if (lower.includes("availability") || lower.includes("free") || lower.includes("busy")) {
        return { intent: "check_availability", params: { date: "today" } };
    }
    if (lower.includes("draft") || lower.includes("reply") || lower.includes("email")) {
        return { intent: "draft_email", params: {} };
    }
    if (lower.includes("create") && (lower.includes("event") || lower.includes("meeting"))) {
        return { intent: "create_event", params: { raw: message } };
    }
    if (lower.includes("delete") && lower.includes("event")) {
        return { intent: "delete_event", params: {} };
    }
    if (lower.includes("inbox") || lower.includes("emails") || lower.includes("messages")) {
        return { intent: "list_emails", params: {} };
    }

    return { intent: "unknown", params: {} };
}

async function handleCalendarCheck(ctx: CommandContext): Promise<string> {
    try {
        const { fetchCalendarEvents } = await import("@/lib/calendar");
        const events = await fetchCalendarEvents(ctx.userId, new Date());

        if (events.length === 0) {
            return "📅 You have no events scheduled for today. Your calendar is clear!";
        }

        const eventList = events.slice(0, 5).map((e) => {
            const start = e.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const end = e.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return `• ${start} - ${end}: ${e.summary}`;
        }).join("\n");

        return `📅 **Today's Schedule**\n\n${eventList}${events.length > 5 ? `\n\n...and ${events.length - 5} more events` : ""}`;
    } catch (error) {
        console.error("Calendar error:", error);
        return "I couldn't access your calendar. Please make sure you've granted calendar permissions.";
    }
}

async function handleAvailabilityCheck(ctx: CommandContext): Promise<string> {
    try {
        const { getAvailability } = await import("@/lib/calendar");
        const availability = await getAvailability(ctx.userId, new Date());

        if (availability.free.length === 0) {
            return "😅 You're fully booked today! No free slots available during business hours (9am-5pm).";
        }

        const freeSlots = availability.free.map((slot) => {
            const start = slot.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const end = slot.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return `• ${start} - ${end}`;
        }).join("\n");

        return `✅ **Available Today**\n\n${freeSlots}`;
    } catch (error) {
        console.error("Availability error:", error);
        return "I couldn't check your availability. Please try again.";
    }
}

async function handleDraftEmail(ctx: CommandContext): Promise<string> {
    try {
        const recentEmails = await db.select()
            .from(emails)
            .where(eq(emails.userId, ctx.userId))
            .orderBy(desc(emails.receivedAt))
            .limit(5);

        const emailToReply = recentEmails.find(e => e.category === "urgent" || e.category === "client") || recentEmails[0];

        if (!emailToReply) {
            return "I don't see any emails to draft a reply for. Your inbox seems empty!";
        }

        let availabilityContext = "";
        try {
            const { getAvailability } = await import("@/lib/calendar");
            const availability = await getAvailability(ctx.userId, new Date());
            if (availability.free.length > 0) {
                const freeSlots = availability.free.slice(0, 2).map((slot) => {
                    return `${slot.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${slot.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                }).join(" or ");
                availabilityContext = `\n\nNote: If they ask about availability, I'm free today at ${freeSlots}.`;
            }
        } catch {
            // Skip availability if calendar isn't available
        }

        const draftContent = await generateDraftReply(
            emailToReply.subject || "",
            (emailToReply.snippet || "") + availabilityContext,
            emailToReply.sender || ""
        );

        const { createGmailDraft } = await import("@/lib/gmail");
        const gmailDraftId = await createGmailDraft(
            ctx.userId,
            emailToReply.sender || "",
            `Re: ${emailToReply.subject}`,
            draftContent,
            emailToReply.threadId || undefined
        );

        await db.insert(drafts).values({
            emailId: emailToReply.id,
            gmailDraftId,
            content: draftContent,
            status: "pending_approval",
        });

        return `✉️ **Draft Created**\n\nReplying to: ${emailToReply.sender}\nSubject: Re: ${emailToReply.subject}\n\n---\n${draftContent}\n---\n\n✅ Draft saved to Gmail. Check your drafts to review and send!`;
    } catch (error) {
        console.error("Draft error:", error);
        return "I couldn't create a draft. Please try again.";
    }
}

async function handleCreateEvent(ctx: CommandContext, rawMessage: string): Promise<string> {
    try {
        const parsePrompt = `Extract event details from this message: "${rawMessage}"

Return ONLY a JSON object with these fields:
{
    "summary": "event title",
    "date": "YYYY-MM-DD",
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "duration": 60
}

If time not specified, default to 2pm. If duration not specified, use 60 minutes.`;

        const aiResponse = await callOllama(parsePrompt);

        let eventDetails;
        try {
            const match = aiResponse.match(/\{[\s\S]*\}/);
            if (match) {
                eventDetails = JSON.parse(match[0]);
            } else {
                throw new Error("No JSON found");
            }
        } catch {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(14, 0, 0, 0);
            const endTime = new Date(tomorrow);
            endTime.setHours(15, 0, 0, 0);
            eventDetails = { summary: "Meeting", start: tomorrow, end: endTime };
        }

        const start = eventDetails.start ? new Date(eventDetails.start) : new Date();
        const end = eventDetails.end ? new Date(eventDetails.end) : new Date(start.getTime() + 60 * 60 * 1000);

        const { createCalendarEvent } = await import("@/lib/calendar");
        const eventId = await createCalendarEvent(ctx.userId, {
            summary: eventDetails.summary || "Meeting",
            start,
            end,
        });

        return `📅 **Event Created!**\n\n• **${eventDetails.summary || "Meeting"}**\n• ${start.toLocaleDateString()} at ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}\n\nEvent ID: ${eventId}`;
    } catch (error) {
        console.error("Create event error:", error);
        return "I couldn't create the event. Please try again with more details like \"Create a meeting called Team Sync tomorrow at 3pm\".";
    }
}

async function handleListEmails(ctx: CommandContext): Promise<string> {
    try {
        const recentEmails = await db.select()
            .from(emails)
            .where(eq(emails.userId, ctx.userId))
            .orderBy(desc(emails.receivedAt))
            .limit(5);

        if (recentEmails.length === 0) {
            return "📭 Your inbox is empty!";
        }

        const emailList = recentEmails.map((e) => {
            const category = e.category ? `[${e.category}]` : "";
            return `• ${category} ${e.subject || "(No subject)"}\n  From: ${e.sender || "Unknown"}`;
        }).join("\n\n");

        return `📬 **Recent Emails**\n\n${emailList}`;
    } catch (error) {
        console.error("List emails error:", error);
        return "I couldn't fetch your emails. Please try again.";
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: "No message provided" }, { status: 400 });
        }

        const ctx: CommandContext = {
            userId: session.user.id,
            userEmail: session.user.email || "",
        };

        const { intent, params } = await parseCommand(message);

        let response: string;

        switch (intent) {
            case "check_calendar":
                response = await handleCalendarCheck(ctx);
                break;
            case "check_availability":
                response = await handleAvailabilityCheck(ctx);
                break;
            case "draft_email":
                response = await handleDraftEmail(ctx);
                break;
            case "create_event":
                response = await handleCreateEvent(ctx, params.raw || message);
                break;
            case "list_emails":
                response = await handleListEmails(ctx);
                break;
            default: {
                const helpPrompt = `The user asked: "${message}"

You are an AI assistant for an email and calendar app. Respond helpfully. Available commands:
- Check calendar/schedule
- Check availability
- Draft email reply
- Create calendar events
- List recent emails

Respond conversationally in 1-2 sentences.`;

                response = await callOllama(helpPrompt);
                if (!response) {
                    response = "I can help you with:\n• Checking your calendar\n• Finding availability\n• Drafting email replies\n• Creating events\n\nTry asking something like \"What's on my calendar today?\" or \"Draft a reply to my latest email\".";
                }
            }
        }

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { response: "Sorry, something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
