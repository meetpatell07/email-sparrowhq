"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon, ArrowUpRight01Icon, Menu01Icon, GridViewIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState, useMemo } from "react";
import { DriveFilesTab } from "@/components/DriveFilesTab";
import { format, isToday, isTomorrow, differenceInMinutes, addDays, startOfDay } from "date-fns";
import useSWR from "swr";
import Link from "next/link";


// ─── Calendar helpers ──────────────────────────────────────────────────────

interface CalendarAttendee {
    email: string;
    displayName?: string;
    self?: boolean;
}

interface CalendarEvent {
    id: string;
    summary: string;
    start: string;
    end: string;
    location?: string;
    attendees?: CalendarAttendee[];
    hangoutLink?: string;
    isAllDay?: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── Calendar tab ──────────────────────────────────────────────────────────

function CalendarTab() {
    // Stable date range: today → +6 days (7 days total). Memoised so the SWR
    // key never changes between renders (avoids the infinite-loading bug where
    // new Date() produces a different ms value every render).
    const { startIso, endIso, days } = useMemo(() => {
        const today = startOfDay(new Date());
        const start = today;
        const end = addDays(today, 7);
        const dayList = Array.from({ length: 7 }, (_, i) => addDays(today, i));
        return {
            startIso: start.toISOString(),
            endIso: end.toISOString(),
            days: dayList,
        };
    }, []); // empty deps → computed once per mount

    const { data, isLoading, error } = useSWR<{ events: CalendarEvent[] }>(
        `/api/calendar?start=${startIso}&end=${endIso}`,
        fetcher
    );

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-[13px] text-[#A8A29E] py-8 justify-center">
                <HugeiconsIcon icon={Loading02Icon} size={14} className="animate-spin" />
                Loading calendar…
            </div>
        );
    }

    if (error) {
        return <p className="text-[13px] text-[#DC2626] py-4">Failed to load calendar.</p>;
    }

    const events = data?.events ?? [];

    // Group events by yyyy-MM-dd key
    const byDay = new Map<string, CalendarEvent[]>();
    for (const e of events) {
        const key = format(new Date(e.start), "yyyy-MM-dd");
        if (!byDay.has(key)) byDay.set(key, []);
        byDay.get(key)!.push(e);
    }

    return (
        <div className="space-y-2">
            {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayEvents = byDay.get(key) ?? [];
                const isToday_ = isToday(day);
                const isTomorrow_ = isTomorrow(day);
                const dayLabel = isToday_ ? "Today" : isTomorrow_ ? "Tomorrow" : format(day, "EEE");

                return (
                    <div
                        key={key}
                        className={`relative flex gap-4 bg-white border rounded-xl px-4 py-3.5 transition-colors group ${isToday_
                                ? "border-[#1C1917]"
                                : "border-[#E7E5E4] hover:border-[#D6D3D1]"
                            }`}
                    >
                        {/* Left: date column */}
                        <div className="shrink-0 w-12 flex flex-col items-center justify-start pt-0.5">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${isToday_ ? "text-[#1C1917]" : "text-[#A8A29E]"}`}>
                                {dayLabel}
                            </span>
                            <span className={`text-[22px] font-bold leading-none mt-0.5 ${isToday_ ? "text-[#1C1917]" : "text-[#D6D3D1]"}`}>
                                {format(day, "d")}
                            </span>
                            <span className="text-[10px] text-[#A8A29E] mt-0.5">{format(day, "MMM")}</span>
                        </div>

                        {/* Divider */}
                        <div className={`w-px self-stretch shrink-0 ${isToday_ ? "bg-[#1C1917]" : "bg-[#F5F5F4]"}`} />

                        {/* Right: events list + arrow */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <a
                                href={`https://calendar.google.com/calendar/r/day/${format(day, "yyyy/M/d")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Open in Google Calendar"
                            >
                                <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} className="text-[#A8A29E] hover:text-[#1C1917]" />
                            </a>
                            {dayEvents.length === 0 ? (
                                <p className="text-[12px] text-[#C7C4C1]">No events</p>
                            ) : (
                                <div className="space-y-2">
                                    {dayEvents.map((event) => {
                                        const start = new Date(event.start);
                                        const end = new Date(event.end);
                                        const durationMin = differenceInMinutes(end, start);
                                        const hasMeet = !!event.hangoutLink;
                                        const others = (event.attendees ?? []).filter((a) => !a.self);
                                        const isMeeting = others.length > 0;

                                        return (
                                            <div key={event.id} className="flex items-start gap-2.5">
                                                {/* Colour dot */}
                                                <span className={`mt-[5px] w-1.5 h-1.5 rounded-full shrink-0 ${isMeeting ? "bg-[#DC2626]" : "bg-[#1D4ED8]"}`} />

                                                <div className="flex-1 min-w-0">
                                                    {/* Title + Meet link */}
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-[13px] font-medium text-[#1C1917] truncate">{event.summary}</p>
                                                        {hasMeet && (
                                                            <a
                                                                href={event.hangoutLink!}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Join Google Meet"
                                                                className="shrink-0"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                                    <path d="M15 10.5V7l4.5 4.5L15 16v-3.5H9v-2h6z" fill="#00832D" />
                                                                    <rect x="2" y="7" width="11" height="10" rx="1.5" fill="#0066DA" />
                                                                </svg>
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Meta: time · duration · participants */}
                                                    <p className="text-[11px] text-[#A8A29E] mt-0.5">
                                                        {event.isAllDay
                                                            ? "All day"
                                                            : format(start, "h:mm a")}
                                                        {!event.isAllDay && durationMin > 0 && (
                                                            <> · {durationMin < 60
                                                                ? `${durationMin} min`
                                                                : `${Math.floor(durationMin / 60)}h${durationMin % 60 ? ` ${durationMin % 60}m` : ""}`
                                                            }</>
                                                        )}
                                                        {isMeeting && <> · {others.length + 1} people</>}
                                                        {event.location && !hasMeet && <> · {event.location}</>}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const [emails, setEmails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"All Sources" | "Gmail" | "Drive" | "Calendar">("All Sources");
    const [driveViewMode, setDriveViewMode] = useState<"list" | "grid">("grid");

    useEffect(() => {
        fetch("/api/emails?limit=20")
            .then((r) => r.json())
            .then((data) => {
                if (data.emails) setEmails(data.emails);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout>
            <div className="min-h-full pb-20">
                <div className="px-4 md:px-6 pt-4 md:pt-6 space-y-6 max-w-4xl mx-auto">

                    {/* Tab bar */}
                    <div className="flex items-center gap-4 md:gap-6 border-b border-[#E7E5E4] pb-3 overflow-x-auto no-scrollbar">
                        {(["All Sources", "Gmail", "Drive", "Calendar"] as const).map((tab) => {
                            const isActive = activeTab === tab;
                            const icons: Record<string, string> = {
                                Gmail: "https://cdn.brandfetch.io/gmail.com/icon/theme/dark/fallback/transparent",
                                Drive: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
                                Calendar: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
                            };
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors whitespace-nowrap ${isActive
                                            ? "text-[#1C1917] pb-3 -mb-3 border-b-2 border-[#1C1917]"
                                            : "text-[#78716C] hover:text-[#1C1917]"
                                        }`}
                                >
                                    {icons[tab] && (
                                        <img src={icons[tab]} alt={tab} className="w-4 h-4 object-contain" />
                                    )}
                                    {tab}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div>
                        {activeTab === "Drive" ? (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[11px] font-semibold text-[#A8A29E] tracking-widest uppercase">DRIVE FILES</h3>
                                    <div className="flex items-center gap-0.5 p-1 bg-[#F5F5F4] rounded-lg">
                                        <button
                                            onClick={() => setDriveViewMode("list")}
                                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${driveViewMode === "list" ? "bg-white shadow-sm text-[#1C1917]" : "text-[#A8A29E] hover:text-[#57534E]"}`}
                                            aria-label="List view"
                                        >
                                            <HugeiconsIcon icon={Menu01Icon} size={15} />
                                        </button>
                                        <button
                                            onClick={() => setDriveViewMode("grid")}
                                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${driveViewMode === "grid" ? "bg-white shadow-sm text-[#1C1917]" : "text-[#A8A29E] hover:text-[#57534E]"}`}
                                            aria-label="Grid view"
                                        >
                                            <HugeiconsIcon icon={GridViewIcon} size={15} />
                                        </button>
                                    </div>
                                </div>
                                <DriveFilesTab viewMode={driveViewMode} />
                            </div>
                        ) : activeTab === "Calendar" ? (
                            <CalendarTab />
                        ) : (
                            <div>
                                {/* Section header with Gmail redirect */}
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[11px] font-semibold text-[#A8A29E] tracking-widest uppercase">Recent Emails</h3>
                                    <a
                                        href="https://mail.google.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F5F5F4] transition-colors"
                                        title="Open Gmail"
                                    >
                                        <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} className="text-[#A8A29E] hover:text-[#57534E]" />
                                    </a>
                                </div>

                                <div className="space-y-2">
                                    {loading ? (
                                        <p className="text-[13px] text-[#A8A29E] flex items-center gap-2">
                                            <HugeiconsIcon icon={Loading02Icon} size={14} className="animate-spin" /> Fetching emails...
                                        </p>
                                    ) : emails.length > 0 ? (
                                        emails.map((email) => {
                                            const timeStr = email.receivedAt
                                                ? new Date(email.receivedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                                                : "";
                                            const senderName = email.sender?.match(/^(.+?)\s*</)?.[1]?.replace(/^"|"$/g, "").trim()
                                                || email.sender?.split("@")[0]
                                                || "Unknown";
                                            const senderEmail = email.sender?.match(/<(.+?)>/)?.[1] || email.sender || "";
                                            const senderInitial = senderName.charAt(0).toUpperCase();
                                            const category = email.categories?.[0];
                                            const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
                                                important: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", label: "Important" },
                                                follow_up: { bg: "bg-[#EFF6FF]", text: "text-[#1D4ED8]", label: "Follow Up" },
                                                scheduled: { bg: "bg-[#ECFDF5]", text: "text-[#059669]", label: "Scheduled" },
                                                finance: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", label: "Finance" },
                                                personal: { bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]", label: "Personal" },
                                                notification: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", label: "Notification" },
                                                marketing: { bg: "bg-[#FFF1F2]", text: "text-[#BE123C]", label: "Marketing" },
                                            };
                                            const catStyle = category ? (categoryStyles[category] ?? null) : null;

                                            return (
                                                <div key={email.id} className="bg-white border border-[#E7E5E4] rounded-lg p-3 hover:border-[#D6D3D1] transition-colors flex gap-3">
                                                    {/* Sender initial avatar */}
                                                    <div className="w-8 h-8 rounded-full bg-[#F5F5F4] text-[#78716C] font-semibold text-[13px] flex items-center justify-center shrink-0 mt-0.5">
                                                        {senderInitial}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        {/* Subject + category badge */}
                                                        <div className="flex items-start justify-between gap-2 mb-0.5">
                                                            <p className="text-[13px] font-semibold text-[#1C1917] leading-snug line-clamp-1">
                                                                &ldquo;{email.subject || "(No Subject)"}&rdquo;
                                                            </p>
                                                            {catStyle && (
                                                                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-[4px] ${catStyle.bg} ${catStyle.text}`}>
                                                                    {catStyle.label}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Sender name + email */}
                                                        <p className="text-[12px] text-[#57534E] mb-1.5">
                                                            <span className="font-medium">{senderName}</span>
                                                            {senderEmail && senderEmail !== senderName && (
                                                                <span className="text-[#A8A29E] ml-1">&lt;{senderEmail}&gt;</span>
                                                            )}
                                                        </p>

                                                        {/* Footer: Read more + time + Gmail icon */}
                                                        <div className="flex items-center justify-between gap-2">
                                                            <Link
                                                                href={`/dashboard/email/${email.gmailId}`}
                                                                className="text-[12px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                                                            >
                                                                Read more
                                                            </Link>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <span className="text-[12px] text-[#A8A29E]">{timeStr}</span>
                                                                <img src="https://cdn.brandfetch.io/gmail.com/icon/theme/dark/fallback/transparent" alt="Gmail" className="w-4 h-4 object-contain opacity-60" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-[13px] text-[#A8A29E]">No emails found.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
