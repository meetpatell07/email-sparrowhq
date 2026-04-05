"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon, Calendar01Icon, ArrowUpRight01Icon, Menu01Icon, GridViewIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { DriveFilesTab } from "@/components/DriveFilesTab";
import { format, isToday, isTomorrow, isYesterday, differenceInMinutes } from "date-fns";
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

const AVATAR_COLORS = [
    ["#EDE9FE", "#7C3AED"],
    ["#DBEAFE", "#1D4ED8"],
    ["#DCFCE7", "#16A34A"],
    ["#FEF3C7", "#D97706"],
    ["#FCE7F3", "#BE185D"],
    ["#F1F5F9", "#475569"],
];

function avatarColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function attendeeInitials(a: CalendarAttendee): string {
    if (a.displayName) {
        const parts = a.displayName.trim().split(/\s+/);
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0].slice(0, 2).toUpperCase();
    }
    return a.email.split("@")[0].slice(0, 2).toUpperCase();
}

function dayLabel(date: Date): string {
    if (isToday(date)) return "TODAY";
    if (isTomorrow(date)) return "TOMORROW";
    if (isYesterday(date)) return "YESTERDAY";
    return format(date, "MMMM d, yyyy").toUpperCase();
}

function groupByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
        const key = format(new Date(e.start), "yyyy-MM-dd");
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);
    }
    return map;
}

// ─── Event card ────────────────────────────────────────────────────────────

function EventCard({ event }: { event: CalendarEvent }) {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const durationMin = differenceInMinutes(end, start);
    const hasMeet = !!event.hangoutLink;
    const others = (event.attendees ?? []).filter((a) => !a.self);
    const isMeeting = others.length > 0;

    return (
        <div className="bg-white border border-[#E7E5E4] rounded-lg px-4 py-3.5 hover:border-[#D6D3D1] transition-colors group">
            {/* Top row: time + badge + meet icon */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {!event.isAllDay && (
                        <span className="text-[12px] font-medium text-[#78716C]">
                            {format(start, "h:mm a")}
                        </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        isMeeting
                            ? "bg-[#FEF2F2] text-[#DC2626]"
                            : "bg-[#EFF6FF] text-[#1D4ED8]"
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isMeeting ? "bg-[#DC2626]" : "bg-[#1D4ED8]"}`} />
                        {isMeeting ? "Meeting" : "Event"}
                    </span>
                </div>

                {hasMeet && (
                    <a
                        href={event.hangoutLink!}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-40 group-hover:opacity-100 transition-opacity"
                        title="Join Google Meet"
                    >
                        {/* Google Meet colour icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M15 10.5V7l4.5 4.5L15 16v-3.5H9v-2h6z" fill="#00832D"/>
                            <rect x="2" y="7" width="11" height="10" rx="1.5" fill="#0066DA"/>
                        </svg>
                    </a>
                )}
            </div>

            {/* Title */}
            <p className="text-[14px] font-semibold text-[#1C1917] leading-snug mb-2.5">
                {event.summary}
            </p>

            {/* Attendees + duration */}
            <div className="flex items-center gap-2.5">
                {others.length > 0 && (
                    <div className="flex items-center -space-x-1.5">
                        {others.slice(0, 4).map((a) => {
                            const [bg, text] = avatarColor(a.email);
                            return (
                                <div
                                    key={a.email}
                                    title={a.displayName || a.email}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white shrink-0"
                                    style={{ background: bg, color: text }}
                                >
                                    {attendeeInitials(a)}
                                </div>
                            );
                        })}
                        {others.length > 4 && (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white bg-[#F5F5F4] text-[#78716C] shrink-0">
                                +{others.length - 4}
                            </div>
                        )}
                    </div>
                )}
                <span className="text-[12px] text-[#A8A29E]">
                    {others.length > 0
                        ? `${others.length + 1} participant${others.length + 1 !== 1 ? "s" : ""}`
                        : "No attendees"}
                    {!event.isAllDay && ` · ${durationMin < 60
                        ? `${durationMin} min`
                        : `${Math.floor(durationMin / 60)}h${durationMin % 60 ? ` ${durationMin % 60}m` : ""}`
                    }`}
                </span>
            </div>

            {/* Location (if any, non-Meet) */}
            {event.location && !hasMeet && (
                <p className="text-[11px] text-[#A8A29E] mt-1.5 truncate">{event.location}</p>
            )}
        </div>
    );
}

// ─── Calendar tab ──────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function CalendarTab() {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 14);   // 2 weeks back
    const end = new Date(now);
    end.setDate(end.getDate() + 30);        // 30 days forward

    const { data, isLoading, error } = useSWR<{ events: CalendarEvent[] }>(
        `/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`,
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

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
                <HugeiconsIcon icon={Calendar01Icon} size={28} className="text-[#D4D0CE]" />
                <p className="text-[13px] text-[#78716C]">No events in this period.</p>
            </div>
        );
    }

    const grouped = groupByDay(events);
    // Sort days: upcoming first (today → future → past)
    const sortedDays = [...grouped.keys()].sort((a, b) => a.localeCompare(b));

    // Separate upcoming vs past
    const todayKey = format(new Date(), "yyyy-MM-dd");
    const upcoming = sortedDays.filter((d) => d >= todayKey);
    const past = sortedDays.filter((d) => d < todayKey).reverse(); // most recent first

    const orderedDays = [...upcoming, ...past];

    return (
        <div className="space-y-6">
            {orderedDays.map((dayKey) => {
                const dayEvents = grouped.get(dayKey)!;
                const dayDate = new Date(dayKey + "T12:00:00");
                return (
                    <div key={dayKey}>
                        <h3 className="text-[11px] font-semibold text-[#A8A29E] tracking-widest uppercase mb-3">
                            {dayLabel(dayDate)}
                        </h3>
                        <div className="space-y-2">
                            {dayEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
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
                                    className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors whitespace-nowrap ${
                                        isActive
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
                                                important:    { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]",  label: "Important" },
                                                follow_up:    { bg: "bg-[#EFF6FF]", text: "text-[#1D4ED8]",  label: "Follow Up" },
                                                scheduled:    { bg: "bg-[#ECFDF5]", text: "text-[#059669]",  label: "Scheduled" },
                                                finance:      { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]",  label: "Finance" },
                                                personal:     { bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]",  label: "Personal" },
                                                notification: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]",  label: "Notification" },
                                                marketing:    { bg: "bg-[#FFF1F2]", text: "text-[#BE123C]",  label: "Marketing" },
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
