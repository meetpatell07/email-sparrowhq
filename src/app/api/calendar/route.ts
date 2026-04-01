import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { auth } = await import("@/lib/auth");
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("start");
        const endDate = searchParams.get("end");
        const availabilityDate = searchParams.get("availability");

        const { fetchCalendarEvents, getAvailability } = await import("@/lib/calendar");

        if (availabilityDate) {
            const availability = await getAvailability(
                session.user.id,
                new Date(availabilityDate)
            );
            return NextResponse.json({ availability });
        }

        const events = await fetchCalendarEvents(
            session.user.id,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );

        return NextResponse.json({ events });
    } catch (error) {
        console.error("Error fetching calendar:", error);
        return NextResponse.json(
            { error: "Failed to fetch calendar" },
            { status: 500 }
        );
    }
}
