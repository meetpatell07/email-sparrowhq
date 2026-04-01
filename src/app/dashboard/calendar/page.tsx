"use client";

import useSWR from "swr";
import { DashboardLayout } from "@/components/DashboardLayout";
import { format, isSameDay, addDays, startOfWeek } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Calendar01Icon,
    Clock01Icon,
    Location01Icon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Loading03Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";

interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: string;
    end: string;
    location?: string;
    attendees?: string[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const startDate = startOfWeek(selectedDate);
    const endDate = addDays(startDate, 7);

    const { data, error, isLoading } = useSWR<{ events: CalendarEvent[] }>(
        `/api/calendar?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        fetcher
    );

    const events = data?.events ?? [];
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    const getEventsForDay = (date: Date) =>
        events.filter((e) => isSameDay(new Date(e.start), date));

    return (
        <DashboardLayout>
            

            <div className="min-h-full pb-20">
                <div className="p-6">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center gap-3">
                            <HugeiconsIcon icon={Loading03Icon} size={22} className="animate-spin text-[#A8A29E]" />
                            <p className="text-[13px] text-[#78716C]">Loading calendar…</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 flex flex-col items-center gap-3">
                            <HugeiconsIcon icon={Calendar01Icon} size={28} className="text-[#E7E5E4]" />
                            <p className="text-[14px] font-medium text-[#1C1917]">Could not load calendar</p>
                            <p className="text-[13px] text-[#78716C]">Make sure you've granted calendar permissions.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {weekDays.map((day) => {
                                const dayEvents = getEventsForDay(day);
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <div
                                        key={day.toISOString()}
                                        className={`min-h-[180px] rounded-[2px] border p-3 ${
                                            isToday
                                                ? "border-[#1C1917] bg-white"
                                                : "border-[#E7E5E4] bg-white"
                                        }`}
                                    >
                                        <div className="mb-3">
                                            <p className={`text-[11px] font-medium uppercase tracking-wider ${isToday ? "text-[#EA580C]" : "text-[#A8A29E]"}`}>
                                                {format(day, "EEE")}
                                            </p>
                                            <p className={`text-[20px] font-semibold leading-tight ${isToday ? "text-[#1C1917]" : "text-[#1C1917]"}`}>
                                                {format(day, "d")}
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
                                            {dayEvents.length === 0 ? (
                                                <p className="text-[11px] text-[#E7E5E4] text-center py-3">—</p>
                                            ) : (
                                                dayEvents.map((event) => (
                                                    <div
                                                        key={event.id}
                                                        className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-[2px] p-2"
                                                    >
                                                        <p className="text-[12px] font-medium text-[#1C1917] truncate">
                                                            {event.summary}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <HugeiconsIcon icon={Clock01Icon} size={11} className="text-[#A8A29E] shrink-0" />
                                                            <span className="text-[11px] text-[#78716C]">
                                                                {format(new Date(event.start), "h:mm a")}
                                                            </span>
                                                        </div>
                                                        {event.location && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <HugeiconsIcon icon={Location01Icon} size={11} className="text-[#A8A29E] shrink-0" />
                                                                <span className="text-[11px] text-[#78716C] truncate">
                                                                    {event.location}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
