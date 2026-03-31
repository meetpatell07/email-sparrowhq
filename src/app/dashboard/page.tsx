"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Mail01Icon,
    Calendar01Icon,
    Invoice01Icon,
    CheckmarkSquare01Icon,
    ArrowUpRight01Icon,
    InboxIcon,
    AlertCircleIcon,
    SparklesIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useEffect, useState } from "react";

const quickLinks = [
    { name: "Emails",    icon: Mail01Icon,            href: "/dashboard/emails",     description: "View and manage your inbox",    accent: "#EA580C" },
    { name: "Calendar",  icon: Calendar01Icon,         href: "/dashboard/calendar",   description: "See your schedule",             accent: "#0284C7" },
    { name: "Invoices",  icon: Invoice01Icon,          href: "/dashboard/invoices",   description: "Track payments",                accent: "#059669" },
    { name: "Drafts",    icon: CheckmarkSquare01Icon,  href: "/dashboard/drafts",     description: "Review AI-generated drafts",    accent: "#D97706" },
];

interface Stats { total: number; urgent: number; drafts: number; invoices: number }

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        fetch("/api/emails?limit=50")
            .then((r) => r.json())
            .then((data) => {
                const emails: any[] = data.emails ?? [];
                setStats({
                    total:    emails.length,
                    urgent:   emails.filter((e) => e.category === "urgent").length,
                    drafts:   emails.filter((e) => e.hasDraft).length,
                    invoices: emails.filter((e) => e.category === "invoice").length,
                });
            })
            .catch(() => {});
    }, []);

    const metrics = [
        { label: "Inbox",     value: stats ? String(stats.total)    : "—", sub: "emails fetched",    icon: InboxIcon,            urgent: false },
        { label: "Urgent",    value: stats ? String(stats.urgent)   : "—", sub: "need attention",    icon: AlertCircleIcon,      urgent: stats ? stats.urgent > 0 : false },
        { label: "AI Drafts", value: stats ? String(stats.drafts)   : "—", sub: "ready to review",   icon: CheckmarkSquare01Icon, urgent: false },
        { label: "Invoices",  value: stats ? String(stats.invoices) : "—", sub: "detected",           icon: Invoice01Icon,        urgent: false },
    ];

    return (
        <DashboardLayout>
            <header className="h-16 flex items-center px-6 border-b border-[#E7E5E4] bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[#78716C] uppercase tracking-wider">SparrowHQ</span>
                    <span className="text-[#E7E5E4]">/</span>
                    <span className="text-[11px] font-medium text-[#1C1917] uppercase tracking-wider">Dashboard</span>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-[#FAFAF9] no-scrollbar">
                <div className="p-6 max-w-5xl mx-auto space-y-6">

                    <div className="pt-2">
                        <h1 className="text-[22px] font-semibold text-[#1C1917]">Welcome back</h1>
                        <p className="text-[13px] text-[#78716C] mt-1">
                            Your inbox is monitored. Use the AI assistant to take action.
                        </p>
                    </div>

                    {/* Metric cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {metrics.map((m) => (
                            <div key={m.label} className="bg-white border border-[#E7E5E4] rounded-[2px] p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-medium text-[#78716C] uppercase tracking-wider">{m.label}</span>
                                    <HugeiconsIcon
                                        icon={m.icon}
                                        size={15}
                                        className={m.urgent ? "text-[#DC2626]" : "text-[#A8A29E]"}
                                    />
                                </div>
                                <p className={`text-[24px] font-semibold leading-none ${m.urgent ? "text-[#DC2626]" : "text-[#1C1917]"}`}>
                                    {m.value}
                                </p>
                                <p className="text-[12px] text-[#78716C] mt-1.5">{m.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick links */}
                    <div>
                        <p className="text-[11px] font-medium text-[#78716C] uppercase tracking-wider mb-3">Navigate</p>
                        <div className="grid grid-cols-2 gap-3">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="bg-white border border-[#E7E5E4] rounded-[2px] p-5 hover:border-[#1C1917] transition-colors group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="w-8 h-8 rounded-[2px] flex items-center justify-center"
                                            style={{ backgroundColor: `${link.accent}18` }}
                                        >
                                            <HugeiconsIcon icon={link.icon} size={16} style={{ color: link.accent }} />
                                        </div>
                                        <HugeiconsIcon
                                            icon={ArrowUpRight01Icon}
                                            size={15}
                                            className="text-[#E7E5E4] group-hover:text-[#78716C] transition-colors"
                                        />
                                    </div>
                                    <p className="text-[14px] font-semibold text-[#1C1917]">{link.name}</p>
                                    <p className="text-[12px] text-[#78716C] mt-0.5">{link.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* AI hint */}
                    <div className="bg-white border border-[#E7E5E4] rounded-[2px] p-5">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-[2px] flex items-center justify-center shrink-0" style={{ backgroundColor: "#EA580C18" }}>
                                <HugeiconsIcon icon={SparklesIcon} size={16} style={{ color: "#EA580C" }} />
                            </div>
                            <div>
                                <p className="text-[14px] font-semibold text-[#1C1917]">Try the AI assistant</p>
                                <p className="text-[13px] text-[#78716C] mt-1 leading-relaxed">
                                    Ask{" "}
                                    <span className="text-[#1C1917] font-medium">"What urgent emails do I have?"</span>,{" "}
                                    <span className="text-[#1C1917] font-medium">"Draft a reply to my latest client email"</span>, or{" "}
                                    <span className="text-[#1C1917] font-medium">"What's on my calendar today?"</span>
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
