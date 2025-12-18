"use client";

import useSWR from "swr";
import { DashboardLayout } from "@/components/DashboardLayout";
import { format, isSameDay, addDays, startOfWeek } from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const startDate = startOfWeek(selectedDate);
    const endDate = addDays(startDate, 7);

    const { data, error, isLoading } = useSWR<{ events: CalendarEvent[] }>(
        `/api/calendar?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        fetcher
    );

    const events = data?.events || [];

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    const getEventsForDay = (date: Date) => {
        return events.filter((event) => isSameDay(new Date(event.start), date));
    };

    return (
        <DashboardLayout>
            <header className="h-16 flex items-center justify-between px-8 border-b border-gray-50 flex-shrink-0">
                <h1 className="text-xl font-semibold text-black">Calendar</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSelectedDate((d) => addDays(d, -7))}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="text-sm font-medium text-gray-600 min-w-[140px] text-center">
                        {format(startDate, "MMM d")} - {format(addDays(startDate, 6), "MMM d, yyyy")}
                    </span>
                    <button
                        onClick={() => setSelectedDate((d) => addDays(d, 7))}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="p-8">
                    {isLoading ? (
                        <div className="py-20 text-center">
                            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">Loading calendar...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center">
                            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">Could not load calendar</p>
                            <p className="text-gray-300 text-sm mt-1">Please make sure you have granted calendar permissions.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-4">
                            {weekDays.map((day) => {
                                const dayEvents = getEventsForDay(day);
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <div
                                        key={day.toISOString()}
                                        className={`min-h-[200px] rounded-2xl border ${isToday ? "border-black bg-gray-50" : "border-gray-100"
                                            } p-4`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-sm font-medium ${isToday ? "text-black" : "text-gray-400"}`}>
                                                {format(day, "EEE")}
                                            </span>
                                            <span className={`text-lg font-bold ${isToday ? "text-black" : "text-gray-900"}`}>
                                                {format(day, "d")}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            {dayEvents.length === 0 ? (
                                                <p className="text-xs text-gray-300 text-center py-4">No events</p>
                                            ) : (
                                                dayEvents.map((event) => (
                                                    <div
                                                        key={event.id}
                                                        className="bg-white rounded-xl p-3 border border-gray-100 hover:border-gray-200 transition-colors"
                                                    >
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {event.summary}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-400">
                                                                {format(new Date(event.start), "h:mm a")}
                                                            </span>
                                                        </div>
                                                        {event.location && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                                <span className="text-xs text-gray-400 truncate">
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
