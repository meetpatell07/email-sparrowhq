import { google } from "googleapis";
import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "./encryption";

export interface CalendarAttendee {
    email: string;
    displayName?: string;
    self?: boolean;
}

export interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: Date;
    end: Date;
    location?: string;
    attendees?: CalendarAttendee[];
    hangoutLink?: string;
    isAllDay?: boolean;
}

export async function getCalendarClient(userId: string) {
    const accounts = await db
        .select()
        .from(account)
        .where(eq(account.userId, userId));
    const googleAccount = accounts.find((acc) => acc.providerId === "google");

    if (!googleAccount || !googleAccount.refreshToken) {
        throw new Error("User has no Google account linked or missing refresh token");
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    let refreshToken = googleAccount.refreshToken;
    try {
        if (refreshToken.includes(":")) {
            refreshToken = await decrypt(refreshToken);
        }
    } catch {
        // ignore, might be plain text
    }

    oauth2Client.setCredentials({
        access_token: googleAccount.accessToken,
        refresh_token: refreshToken,
    });

    oauth2Client.on("tokens", async (tokens) => {
        if (tokens.access_token) {
            await db
                .update(account)
                .set({
                    accessToken: tokens.access_token,
                    accessTokenExpiresAt: tokens.expiry_date
                        ? new Date(tokens.expiry_date)
                        : undefined,
                })
                .where(eq(account.id, googleAccount.id));
        }
    });

    return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function fetchCalendarEvents(
    userId: string,
    startDate: Date = new Date(),
    endDate?: Date
): Promise<CalendarEvent[]> {
    const calendar = await getCalendarClient(userId);

    // Default to 7 days from now if no end date
    const defaultEnd = new Date(startDate);
    defaultEnd.setDate(defaultEnd.getDate() + 7);

    const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: startDate.toISOString(),
        timeMax: (endDate || defaultEnd).toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 50,
    });

    const events = response.data.items || [];

    return events.map((event) => ({
        id: event.id || "",
        summary: event.summary || "(No title)",
        description: event.description || undefined,
        start: new Date(event.start?.dateTime || event.start?.date || new Date()),
        end: new Date(event.end?.dateTime || event.end?.date || new Date()),
        location: event.location || undefined,
        attendees: event.attendees
            ?.filter((a) => a.email)
            .map((a) => ({
                email: a.email!,
                displayName: a.displayName || undefined,
                self: a.self || false,
            })) ?? [],
        hangoutLink: (event as any).hangoutLink || undefined,
        isAllDay: !event.start?.dateTime,
    }));
}

export async function getAvailability(userId: string, date: Date): Promise<{
    busy: { start: Date; end: Date }[];
    free: { start: Date; end: Date }[];
}> {
    const dayStart = new Date(date);
    dayStart.setHours(9, 0, 0, 0); // Business hours start at 9am

    const dayEnd = new Date(date);
    dayEnd.setHours(17, 0, 0, 0); // Business hours end at 5pm

    const events = await fetchCalendarEvents(userId, dayStart, dayEnd);

    const busy = events.map((e) => ({ start: e.start, end: e.end }));

    // Calculate free slots (simplified)
    const free: { start: Date; end: Date }[] = [];
    let currentTime = new Date(dayStart);

    for (const slot of busy) {
        if (currentTime < slot.start) {
            free.push({ start: new Date(currentTime), end: new Date(slot.start) });
        }
        currentTime = new Date(Math.max(currentTime.getTime(), slot.end.getTime()));
    }

    if (currentTime < dayEnd) {
        free.push({ start: new Date(currentTime), end: new Date(dayEnd) });
    }

    return { busy, free };
}

export async function createCalendarEvent(
    userId: string,
    event: {
        summary: string;
        description?: string;
        start: Date;
        end: Date;
        location?: string;
        attendees?: string[];
    }
): Promise<string> {
    const calendar = await getCalendarClient(userId);

    const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
            summary: event.summary,
            description: event.description,
            location: event.location,
            start: {
                dateTime: event.start.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
                dateTime: event.end.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            attendees: event.attendees?.map((email) => ({ email })),
        },
    });

    return response.data.id || "";
}

export async function deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
    const calendar = await getCalendarClient(userId);

    await calendar.events.delete({
        calendarId: "primary",
        eventId,
    });
}
