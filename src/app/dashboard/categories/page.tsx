"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon, Tag01Icon } from "@hugeicons/core-free-icons";

const CATEGORY_GROUPS = [
    {
        heading: "Action",
        description: "What the email requires from you",
        items: [
            {
                key: "priority",
                label: "Priority",
                gmailLabel: "Priority",
                dot: "#fb4c2f",
                bg: "bg-[#FEF2F2]",
                text: "text-[#DC2626]",
                description: "High-signal emails that need your attention",
            },
            {
                key: "follow_up",
                label: "Follow Up",
                gmailLabel: "Follow Up",
                dot: "#285bac",
                bg: "bg-[#EFF6FF]",
                text: "text-[#1D4ED8]",
                description: "You replied and are awaiting a response",
            },
            {
                key: "scheduled",
                label: "Planned",
                gmailLabel: "Planned",
                dot: "#16a765",
                bg: "bg-[#ECFDF5]",
                text: "text-[#059669]",
                description: "Meetings, calendar invites, or scheduling threads",
            },
        ],
    },
    {
        heading: "Context",
        description: "What the email is about",
        items: [
            {
                key: "finance",
                label: "Finance",
                gmailLabel: "Finance",
                dot: "#0b804b",
                bg: "bg-[#F0FDF4]",
                text: "text-[#16A34A]",
                description: "Invoices, receipts, billing, and payments",
            },
            {
                key: "personal",
                label: "Personal",
                gmailLabel: "Personal",
                dot: "#8e63ce",
                bg: "bg-[#F5F3FF]",
                text: "text-[#7C3AED]",
                description: "Friends, family, and non-work communication",
            },
        ],
    },
    {
        heading: "Passive",
        description: "Low priority, no action needed",
        items: [
            {
                key: "notification",
                label: "Notification",
                gmailLabel: "Notification",
                dot: "#ffad47",
                bg: "bg-[#FFFBEB]",
                text: "text-[#D97706]",
                description: "OTPs, password resets, and automated alerts",
            },
            {
                key: "marketing",
                label: "Marketing",
                gmailLabel: "Marketing",
                dot: "#ac2b16",
                bg: "bg-[#FFF1F2]",
                text: "text-[#BE123C]",
                description: "Newsletters, promotions, and sales outreach",
            },
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
                        <p className="text-[13px] text-[#78716C] mt-1">
                            AI assigns up to 2 labels per email — one for action, one for context. Passive emails receive a single label.
                        </p>
                    </div>

                    {/* Info card */}
                    <div className="bg-white border border-[#E7E5E4] rounded-xl p-4 mb-6 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EA580C18] flex items-center justify-center shrink-0">
                            <HugeiconsIcon icon={SparklesIcon} size={16} className="text-[#EA580C]" />
                        </div>
                        <div>
                            <p className="text-[14px] font-medium text-[#1C1917]">Multi-Label Classification</p>
                            <p className="text-[13px] text-[#78716C] mt-0.5 leading-relaxed">
                                Each email gets 1–2 labels: one describing <strong>what to do</strong> and one describing <strong>what it&apos;s about</strong>.
                                Labels sync directly to your Gmail inbox so you can filter there too.
                            </p>
                        </div>
                    </div>

                    {/* Groups */}
                    <div className="space-y-6">
                        {CATEGORY_GROUPS.map((group) => (
                            <div key={group.heading}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]">
                                        {group.heading}
                                    </span>
                                    <span className="text-[11px] text-[#C7C4C1]">— {group.description}</span>
                                </div>
                                <div className="bg-white border border-[#E7E5E4] rounded-xl overflow-hidden">
                                    {/* Column header */}
                                    <div className="flex items-center px-5 py-2 border-b border-[#F5F5F4] bg-[#FAFAF9]">
                                        <span className="w-28 text-[10px] font-semibold uppercase tracking-wider text-[#C7C4C1]">Label</span>
                                        <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-[#C7C4C1]">Description</span>
                                        <span className="w-24 text-right text-[10px] font-semibold uppercase tracking-wider text-[#C7C4C1]">Gmail label</span>
                                    </div>
                                    {group.items.map((cat, i) => (
                                        <div
                                            key={cat.key}
                                            className={`flex items-center px-5 py-3.5 ${i < group.items.length - 1 ? "border-b border-[#F5F5F4]" : ""}`}
                                        >
                                            {/* Badge */}
                                            <div className="w-28 shrink-0">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-md ${cat.bg} ${cat.text}`}>
                                                    <span
                                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                                        style={{ background: cat.dot }}
                                                    />
                                                    {cat.label}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <span className="flex-1 text-[13px] text-[#78716C]">{cat.description}</span>

                                            {/* Gmail label */}
                                            <div className="w-24 flex justify-end">
                                                <div className="flex items-center gap-1 text-[11px] text-[#A8A29E]">
                                                    <HugeiconsIcon icon={Tag01Icon} size={11} />
                                                    {cat.gmailLabel}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer note */}
                    <p className="mt-6 text-[12px] text-[#A8A29E] text-center">
                        7 categories total · labels are created automatically in your Gmail account on first use
                    </p>

                </div>
            </div>
        </DashboardLayout>
    );
}
