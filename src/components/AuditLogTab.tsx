"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    SparklesIcon,
    CheckmarkSquare01Icon,
    Cancel01Icon,
    Invoice01Icon,
    Tag01Icon,
    AlertCircleIcon,
    InformationCircleIcon,
    Clock01Icon,
    FilterIcon,
} from "@hugeicons/core-free-icons";

interface AuditEntry {
    id: string;
    action: string;
    gmailMessageId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}

const ACTION_CONFIG: Record<string, { label: string; icon: typeof SparklesIcon; color: string; bg: string }> = {
    email_classified:           { label: "Email classified",          icon: Tag01Icon,              color: "#6366f1", bg: "#6366f110" },
    draft_created:              { label: "Draft created",             icon: CheckmarkSquare01Icon,  color: "#059669", bg: "#05966910" },
    draft_skipped_ai_gate:      { label: "Draft skipped — AI gate",   icon: AlertCircleIcon,        color: "#D97706", bg: "#D9770610" },
    draft_skipped_thread_exists:{ label: "Draft skipped — duplicate", icon: InformationCircleIcon,  color: "#78716C", bg: "#78716C10" },
    draft_skipped_self_sender:  { label: "Skipped — sent by you",     icon: InformationCircleIcon,  color: "#78716C", bg: "#78716C10" },
    invoice_extracted:          { label: "Invoice extracted",         icon: Invoice01Icon,          color: "#0284C7", bg: "#0284C710" },
    label_applied:              { label: "Label applied",             icon: Tag01Icon,              color: "#7C3AED", bg: "#7C3AED10" },
    draft_approved:             { label: "Draft approved",            icon: CheckmarkSquare01Icon,  color: "#059669", bg: "#05966910" },
    draft_rejected:             { label: "Draft rejected",            icon: Cancel01Icon,           color: "#DC2626", bg: "#DC262610" },
};

const ALL_FILTER = "all";

function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
}

function MetadataBadges({ meta }: { meta: Record<string, unknown> | null }) {
    if (!meta) return null;
    const badges: { key: string; value: string }[] = [];

    if (Array.isArray(meta.categories)) {
        badges.push({ key: "category", value: (meta.categories as string[]).join(", ") });
    }
    if (meta.reason) badges.push({ key: "reason", value: String(meta.reason).replace(/_/g, " ") });
    if (meta.vendorName) badges.push({ key: "vendor", value: String(meta.vendorName) });
    if (meta.amount) badges.push({ key: "amount", value: `${meta.currency ?? ""}${meta.amount}` });
    if (meta.usedStyleSamples != null) badges.push({ key: "style samples", value: `${meta.usedStyleSamples}` });

    if (badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
            {badges.map((b) => (
                <span
                    key={b.key}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#F5F5F4] text-[#57534E] font-medium"
                >
                    <span className="text-[#A8A29E]">{b.key}</span>
                    {b.value}
                </span>
            ))}
        </div>
    );
}

export function AuditLogTab() {
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>(ALL_FILTER);

    useEffect(() => {
        fetch("/api/audit?limit=100")
            .then(r => r.json())
            .then(data => setLogs(data.logs ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filters = [
        { value: ALL_FILTER, label: "All" },
        { value: "draft_created", label: "Drafts created" },
        { value: "email_classified", label: "Classifications" },
        { value: "draft_skipped_ai_gate", label: "Skipped" },
        { value: "invoice_extracted", label: "Invoices" },
        { value: "draft_approved", label: "Approved" },
        { value: "draft_rejected", label: "Rejected" },
    ];

    const visible = filter === ALL_FILTER ? logs : logs.filter(l => l.action === filter);

    return (
        <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-[22px] font-heading font-bold text-[#1C1917] tracking-tight">Trust Log</h1>
                <p className="text-[13px] text-[#78716C] mt-1">
                    Every action the AI took on your behalf — transparent and auditable.
                </p>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-1.5 mb-5 flex-wrap">
                <HugeiconsIcon icon={FilterIcon} size={14} className="text-[#A8A29E] shrink-0" />
                {filters.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={[
                            "text-[12px] font-medium px-3 py-1 rounded-full border transition-colors",
                            filter === f.value
                                ? "bg-[#1C1917] text-white border-[#1C1917]"
                                : "bg-white text-[#57534E] border-[#E7E5E4] hover:bg-[#F5F5F4]",
                        ].join(" ")}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-[#A8A29E]">
                    <div className="w-5 h-5 border-2 border-[#E7E5E4] border-t-[#1C1917] rounded-full animate-spin mb-3" />
                    <span className="text-[13px]">Loading…</span>
                </div>
            )}

            {!loading && visible.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-[#A8A29E]">
                    <HugeiconsIcon icon={SparklesIcon} size={32} className="mb-3 opacity-30" />
                    <p className="text-[14px]">No log entries yet.</p>
                    <p className="text-[12px] mt-1">Actions will appear here as emails are processed.</p>
                </div>
            )}

            {!loading && visible.length > 0 && (
                <div className="space-y-2">
                    {visible.map((entry) => {
                        const cfg = ACTION_CONFIG[entry.action] ?? {
                            label: entry.action.replace(/_/g, " "),
                            icon: InformationCircleIcon,
                            color: "#78716C",
                            bg: "#78716C10",
                        };
                        const Icon = cfg.icon;

                        return (
                            <div
                                key={entry.id}
                                className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-white border border-[#E7E5E4]"
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                    style={{ background: cfg.bg }}
                                >
                                    <HugeiconsIcon icon={Icon} size={16} style={{ color: cfg.color }} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[13px] font-medium text-[#1C1917]">{cfg.label}</span>
                                        {entry.gmailMessageId && (
                                            <span className="text-[11px] text-[#A8A29E] font-mono truncate max-w-[120px]">
                                                {entry.gmailMessageId.slice(0, 12)}…
                                            </span>
                                        )}
                                    </div>
                                    <MetadataBadges meta={entry.metadata} />
                                </div>

                                <div className="flex items-center gap-1 text-[11px] text-[#A8A29E] shrink-0 mt-0.5">
                                    <HugeiconsIcon icon={Clock01Icon} size={12} />
                                    {formatTime(entry.createdAt)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && logs.length > 0 && (
                <p className="text-center text-[11px] text-[#A8A29E] mt-6">
                    Showing {visible.length} of {logs.length} entries · Last 100 actions
                </p>
            )}
        </div>
    );
}
