"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";

const CATEGORY_GROUPS = [
    {
        heading: "Action",
        description: "What the user needs to do",
        items: [
            { key: "to_do",     label: "To Do",     bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", description: "Requires a reply or action from you" },
            { key: "follow_up", label: "Follow Up",  bg: "bg-[#EFF6FF]", text: "text-[#1D4ED8]", description: "You've replied and are awaiting a response" },
            { key: "scheduled", label: "Scheduled",  bg: "bg-[#ECFDF5]", text: "text-[#059669]", description: "Meetings, calendar events, or scheduling" },
        ],
    },
    {
        heading: "Context",
        description: "What the email is about",
        items: [
            { key: "finance",  label: "Finance",  bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", description: "Invoices, receipts, billing, payments" },
            { key: "work",     label: "Work",     bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", description: "Clients, colleagues, business communication" },
            { key: "personal", label: "Personal", bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]", description: "Friends, family, non-work communication" },
        ],
    },
    {
        heading: "Passive",
        description: "Low priority",
        items: [
            { key: "notification", label: "Notification", bg: "bg-[#FFFBEB]", text: "text-[#D97706]", description: "OTPs, password resets, automated alerts" },
            { key: "marketing",    label: "Marketing",    bg: "bg-[#FFF1F2]", text: "text-[#BE123C]", description: "Newsletters, promotions, sales outreach" },
        ],
    },
];

export default function CategoriesPage() {
    return (
        <DashboardLayout>
            <div className="min-h-full pb-20">
                <div className="p-6 max-w-3xl mx-auto">

                    <div className="mb-4">
                        <h1 className="text-[22px] font-semibold text-[#1C1917]">Email Categories</h1>
                        <p className="text-[13px] text-[#78716C] mt-1">AI assigns up to 2 labels per email across action, context, and passive groups</p>
                    </div>

                    {/* Info card */}
                    <div className="bg-white border border-[#E7E5E4] rounded-[2px] p-4 mb-6 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-[2px] bg-[#EA580C18] flex items-center justify-center shrink-0">
                            <HugeiconsIcon icon={SparklesIcon} size={16} className="text-[#EA580C]" />
                        </div>
                        <div>
                            <p className="text-[14px] font-medium text-[#1C1917]">Multi-Label Classification</p>
                            <p className="text-[13px] text-[#78716C] mt-0.5 leading-relaxed">
                                Each email gets 1–2 labels: one describing <strong>what to do</strong> (action) and one describing <strong>what it&apos;s about</strong> (context). Passive emails like marketing or notifications get a single label.
                            </p>
                        </div>
                    </div>

                    {/* Groups */}
                    <div className="space-y-5">
                        {CATEGORY_GROUPS.map((group) => (
                            <div key={group.heading}>
                                <div className="mb-2">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]">
                                        {group.heading}
                                    </span>
                                    <span className="ml-2 text-[11px] text-[#C7C4C1]">— {group.description}</span>
                                </div>
                                <div className="bg-white border border-[#E7E5E4] rounded-[2px] overflow-hidden">
                                    {group.items.map((cat, i) => (
                                        <div
                                            key={cat.key}
                                            className={`flex items-center justify-between px-5 py-4 ${i < group.items.length - 1 ? "border-b border-[#E7E5E4]" : ""}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium rounded-[2px] ${cat.bg} ${cat.text}`}>
                                                    {cat.label}
                                                </span>
                                                <span className="text-[13px] text-[#78716C]">{cat.description}</span>
                                            </div>
                                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-[#059669] shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
