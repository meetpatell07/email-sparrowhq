import { format, isToday, isTomorrow, addDays, startOfDay } from "date-fns";
import type { CalendarEvent } from "./calendar";

/**
 * Categories where calendar context meaningfully improves a draft reply.
 *
 * - "scheduled": email is explicitly about meetings/events — include full 7-day view
 * - "priority" / "follow_up": may reference scheduling — include today's availability only
 *
 * "finance", "personal", "notification", "marketing" never need calendar context,
 * so we skip the API call entirely for those.
 */
const CALENDAR_RELEVANT = new Set(["scheduled", "priority", "follow_up"]);

/**
 * Builds a rich, AI-ready calendar context string for use in draft generation.
 *
 * Returns "" (empty) when:
 *  - no category in the email warrants calendar context
 *  - calendar API is unavailable or the user has no Google Calendar linked
 *  - the fetch exceeds the 4 s timeout (so drafting is never blocked)
 *
 * Usage:
 *   const ctx = await getCalendarContextForDraft(userId, categories);
 *   const draft = await generateDraftReply(subject, body, sender, ctx);
 */
export async function getCalendarContextForDraft(
    userId: string,
    categories: string[]
): Promise<string> {
    const isRelevant = categories.some((c) => CALENDAR_RELEVANT.has(c));
    if (!isRelevant) return "";

    // "scheduled" emails (meeting requests, calendar invites) need the full
    // 7-day window so the AI can suggest concrete alternative dates.
    // For "priority"/"follow_up" we only need today's availability.
    const includeWeek = categories.includes("scheduled");

    try {
        const contextPromise = buildCalendarContext(userId, includeWeek);

        // Race against a hard 4 s ceiling — never let a slow Calendar API
        // block the draft pipeline in production.
        const result = await Promise.race<string>([
            contextPromise,
            new Promise<string>((_, reject) =>
                setTimeout(() => reject(new Error("timeout")), 4000)
            ),
        ]);

        return result;
    } catch (err) {
        console.warn("[calendar-context] Skipping calendar context:", (err as Error).message);
        return "";
    }
}

// ─── Internal builder ─────────────────────────────────────────────────────────

async function buildCalendarContext(userId: string, includeWeek: boolean): Promise<string> {
    const { fetchCalendarEvents, getAvailability } = await import("./calendar");

    const now = new Date();
    const weekEnd = addDays(startOfDay(now), 7);

    // Fetch in parallel: today's free/busy slots + (optionally) upcoming week events
    const [availability, weekEvents] = await Promise.all([
        getAvailability(userId, now).catch(() => null),
        includeWeek
            ? fetchCalendarEvents(userId, now, weekEnd).catch(() => [] as CalendarEvent[])
            : Promise.resolve([] as CalendarEvent[]),
    ]);

    const sections: string[] = ["[Calendar Context]"];

    // ── Today's schedule ─────────────────────────────────────────────────────
    if (availability) {
        if (availability.busy.length === 0) {
            sections.push("Today: No meetings — calendar is clear all day.");
        } else {
            const busyLines = availability.busy
                .map((b) => `  • ${format(b.start, "h:mm a")} – ${format(b.end, "h:mm a")}`)
                .join("\n");
            sections.push(`Today's meetings:\n${busyLines}`);
        }

        if (availability.free.length > 0) {
            const freeLines = availability.free
                .map((f) => `  • ${format(f.start, "h:mm a")} – ${format(f.end, "h:mm a")}`)
                .join("\n");
            sections.push(`Today's available slots (9 am – 5 pm):\n${freeLines}`);
        } else if (availability.busy.length > 0) {
            sections.push("Today: Fully booked during business hours.");
        }
    }

    // ── Upcoming week (only for scheduling-related emails) ───────────────────
    if (includeWeek && weekEvents.length > 0) {
        const upcoming = weekEvents.filter((e) => e.start > now).slice(0, 12);

        if (upcoming.length > 0) {
            // Group by calendar day
            const byDay = new Map<string, CalendarEvent[]>();
            for (const e of upcoming) {
                const key = format(e.start, "yyyy-MM-dd");
                if (!byDay.has(key)) byDay.set(key, []);
                byDay.get(key)!.push(e);
            }

            const weekLines: string[] = [];
            for (const [key, dayEvents] of byDay) {
                const d = new Date(key + "T12:00:00");
                const label = isToday(d)
                    ? "Today"
                    : isTomorrow(d)
                    ? "Tomorrow"
                    : format(d, "EEEE, MMM d");

                const eventLines = dayEvents
                    .map((e) =>
                        `    – ${e.isAllDay ? "All day" : format(e.start, "h:mm a")}: ${e.summary}`
                    )
                    .join("\n");

                weekLines.push(`  ${label}:\n${eventLines}`);
            }

            sections.push(`Upcoming this week:\n${weekLines.join("\n")}`);
        }
    }

    return sections.join("\n\n");
}
