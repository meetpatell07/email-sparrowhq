"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Archive01Icon,
    File01Icon,
    FileSpreadsheetIcon,
    Image01Icon,
    ArrowRight01Icon,
    Cancel01Icon,
    Download01Icon,
    GoogleDriveIcon,
    Mail01Icon,
    SparklesIcon,
    Loading03Icon,
    CheckmarkCircle01Icon,
    Copy01Icon,
} from "@hugeicons/core-free-icons";
import { format, isToday, isYesterday } from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VaultAttachment {
    id: string;
    filename: string;
    contentType: string | null;
    size: number | null;
    r2Key: string;
    driveFileId: string | null;
    driveWebViewLink: string | null;
    createdAt: string;
    emailId: string;
    emailGmailId: string;
    // emailSubject / emailSender / emailSnippet no longer stored in DB (privacy-first).
    // Use emailGmailId to open the original email in Gmail if needed.
    emailReceivedAt: string;
    emailCategories: string[] | null;
}

type FileType = "image" | "pdf" | "sheet" | "doc" | "other";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFileType(contentType: string | null, filename: string): FileType {
    const ct = contentType ?? "";
    const name = filename.toLowerCase();
    if (ct.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|svg)$/.test(name)) return "image";
    if (ct === "application/pdf" || name.endsWith(".pdf")) return "pdf";
    if (ct.includes("spreadsheet") || ct.includes("csv") || /\.(xlsx?|csv)$/.test(name)) return "sheet";
    if (ct.includes("document") || ct.includes("word") || /\.(docx?|txt|md)$/.test(name)) return "doc";
    return "other";
}

const FILE_CONFIG: Record<FileType, { color: string; bg: string; label: string }> = {
    image: { color: "#7C3AED", bg: "#F5F3FF", label: "Image" },
    pdf:   { color: "#DC2626", bg: "#FEF2F2", label: "PDF" },
    sheet: { color: "#059669", bg: "#ECFDF5", label: "Sheet" },
    doc:   { color: "#2563EB", bg: "#EFF6FF", label: "Doc" },
    other: { color: "#78716C", bg: "#F5F5F4", label: "File" },
};

function formatSize(bytes: number | null): string {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
    if (isYesterday(d)) return `Yesterday, ${format(d, "h:mm a")}`;
    return format(d, "d MMM yyyy");
}


function FileIcon({ type, size = 18 }: { type: FileType; size?: number }) {
    const { color } = FILE_CONFIG[type];
    const icon =
        type === "sheet" ? FileSpreadsheetIcon :
        type === "image" ? Image01Icon :
        File01Icon;
    return <HugeiconsIcon icon={icon} size={size} style={{ color }} />;
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function AttachmentPanel({
    item,
    onClose,
}: {
    item: VaultAttachment;
    onClose: () => void;
}) {
    const fileType = getFileType(item.contentType, item.filename);
    const { color, label } = FILE_CONFIG[fileType];

    const [downloading, setDownloading] = useState(false);
    const [draftLoading, setDraftLoading] = useState(false);
    const [driveLoading, setDriveLoading] = useState(false);
    const [draft, setDraft] = useState<string | null>(null);
    const [draftCopied, setDraftCopied] = useState(false);
    const [savedToDrive, setSavedToDrive] = useState(!!item.driveFileId);
    const [driveLink, setDriveLink] = useState(item.driveWebViewLink);
    const [error, setError] = useState<string | null>(null);

    async function handleDownload() {
        setDownloading(true);
        try {
            const res = await fetch(`/api/vault/${item.id}/download`);
            const { url } = await res.json();
            window.open(url, "_blank");
        } catch {
            setError("Download failed.");
        } finally {
            setDownloading(false);
        }
    }

    async function handleDraftReply() {
        setDraftLoading(true);
        setDraft(null);
        setError(null);
        try {
            const res = await fetch(`/api/vault/${item.id}/draft-reply`, { method: "POST" });
            const data = await res.json();
            setDraft(data.draft);
        } catch {
            setError("Failed to generate draft.");
        } finally {
            setDraftLoading(false);
        }
    }

    async function handleSaveToDrive() {
        setDriveLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/vault/${item.id}/save-to-drive`, { method: "POST" });
            if (res.status === 409) {
                setError("Already saved to Drive.");
                setSavedToDrive(true);
                return;
            }
            const data = await res.json();
            setSavedToDrive(true);
            setDriveLink(data.driveWebViewLink);
        } catch {
            setError("Failed to save to Drive.");
        } finally {
            setDriveLoading(false);
        }
    }

    function handleCopyDraft() {
        if (!draft) return;
        navigator.clipboard.writeText(draft);
        setDraftCopied(true);
        setTimeout(() => setDraftCopied(false), 2000);
    }

    return (
        <>
            {/* Mobile backdrop */}
            <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose} />
        <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const }}
            className={[
                // mobile: fixed full-height panel from right edge
                "fixed right-0 top-0 h-full w-[min(340px,100vw)] z-50 md:z-auto",
                // desktop: static side panel
                "md:relative md:w-[340px] md:h-auto",
                "shrink-0 border-l border-[#E7E5E4] bg-white flex flex-col overflow-y-auto",
            ].join(" ")}
        >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-[#E7E5E4]">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0" style={{ background: FILE_CONFIG[fileType].bg }}>
                        <FileIcon type={fileType} size={20} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-[#1C1917] leading-snug break-all">{item.filename}</p>
                        <span className="text-[12px] font-medium" style={{ color }}>{label} · {formatSize(item.size)}</span>
                    </div>
                </div>
                <button onClick={onClose} className="shrink-0 text-[#A8A29E] hover:text-[#57534E] transition-colors">
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>
            </div>

            {/* Email reference */}
            <div className="px-5 py-4 border-b border-[#E7E5E4]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A8A29E] mb-2">From Email</p>
                <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#F5F5F4] flex items-center justify-center shrink-0 mt-0.5">
                        <HugeiconsIcon icon={Mail01Icon} size={13} className="text-[#78716C]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[12px] text-[#78716C] truncate mt-0.5">Received {formatDate(item.emailReceivedAt)}</p>
                        <a
                            href={`/dashboard/email/${item.emailGmailId}`}
                            className="text-[11px] text-[#A8A29E] hover:text-[#1C1917] transition-colors mt-1 inline-block"
                        >
                            View original email →
                        </a>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-5 mt-4 px-3 py-2 bg-[#FEF2F2] rounded-md border border-[#FECACA]">
                    <p className="text-[12px] text-[#DC2626]">{error}</p>
                </div>
            )}

            {/* Actions */}
            <div className="p-5 space-y-2.5">
                {/* Download */}
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-2.5 w-full px-4 py-3 rounded-lg border border-[#E7E5E4] text-[14px] font-medium text-[#1C1917] hover:bg-[#F5F5F4] transition-colors disabled:opacity-50"
                >
                    {downloading
                        ? <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin shrink-0 text-[#78716C]" />
                        : <HugeiconsIcon icon={Download01Icon} size={16} className="shrink-0 text-[#57534E]" />
                    }
                    Download
                </button>

                {/* Save to Drive */}
                {savedToDrive && driveLink ? (
                    <a
                        href={driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 w-full px-4 py-3 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] text-[14px] font-medium text-[#16A34A] hover:bg-[#DCFCE7] transition-colors"
                    >
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="shrink-0" />
                        Saved — Open in Drive
                    </a>
                ) : (
                    <button
                        onClick={handleSaveToDrive}
                        disabled={driveLoading}
                        className="flex items-center gap-2.5 w-full px-4 py-3 rounded-lg border border-[#E7E5E4] text-[14px] font-medium text-[#1C1917] hover:bg-[#F5F5F4] transition-colors disabled:opacity-50"
                    >
                        {driveLoading
                            ? <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin shrink-0 text-[#78716C]" />
                            : <HugeiconsIcon icon={GoogleDriveIcon} size={16} className="shrink-0 text-[#57534E]" />
                        }
                        Save to Google Drive
                    </button>
                )}

                {/* Draft Follow-up */}
                <button
                    onClick={handleDraftReply}
                    disabled={draftLoading}
                    className="flex items-center gap-2.5 w-full px-4 py-3 rounded-lg bg-[#1C1917] text-[14px] font-medium text-white hover:bg-[#292524] transition-colors disabled:opacity-50"
                >
                    {draftLoading
                        ? <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin shrink-0" />
                        : <HugeiconsIcon icon={SparklesIcon} size={16} className="shrink-0" />
                    }
                    Draft Follow-up Email
                </button>
            </div>

            {/* Generated draft */}
            <AnimatePresence>
                {draft && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="px-5 pb-5"
                    >
                        <div className="border border-[#E7E5E4] rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAFAF9] border-b border-[#E7E5E4]">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]">AI Draft</span>
                                <button
                                    onClick={handleCopyDraft}
                                    className="flex items-center gap-1.5 text-[11px] font-medium text-[#57534E] hover:text-[#1C1917] transition-colors"
                                >
                                    <HugeiconsIcon icon={draftCopied ? CheckmarkCircle01Icon : Copy01Icon} size={13} />
                                    {draftCopied ? "Copied" : "Copy"}
                                </button>
                            </div>
                            <p className="px-4 py-3 text-[13px] text-[#1C1917] leading-relaxed whitespace-pre-wrap">{draft}</p>
                        </div>
                        <p className="mt-2 text-[11px] text-[#A8A29E]">
                            Copy this draft and paste it into Gmail to send.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
        </>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
    { key: "all", label: "All" },
    { key: "image", label: "Images" },
    { key: "pdf", label: "PDFs" },
    { key: "sheet", label: "Sheets" },
    { key: "doc", label: "Docs" },
    { key: "other", label: "Other" },
] as const;

type FilterKey = typeof FILTER_OPTIONS[number]["key"];

const fetcher = (url: string) =>
    fetch(url).then((r) => {
        if (!r.ok) throw new Error(`API error ${r.status}`);
        return r.json();
    });

export default function VaultPage() {
    const [filter, setFilter] = useState<FilterKey>("all");
    const [selected, setSelected] = useState<VaultAttachment | null>(null);

    const { data, isLoading, error } = useSWR<{ attachments: VaultAttachment[] }>("/api/vault", fetcher);
    const all = data?.attachments ?? [];

    const counts = useMemo(() => {
        const result: Record<string, number> = { all: all.length };
        for (const a of all) {
            const t = getFileType(a.contentType, a.filename);
            result[t] = (result[t] ?? 0) + 1;
        }
        return result;
    }, [all]);

    const filtered = useMemo(() => {
        if (filter === "all") return all;
        return all.filter((a) => getFileType(a.contentType, a.filename) === filter);
    }, [all, filter]);

    return (
        <DashboardLayout>
            <div className="h-full flex flex-col overflow-hidden">
                {/* Sub-header */}
                <div className="px-4 pt-4 pb-3 shrink-0">
                    <p className="text-[13px] text-[#78716C]">Attachments from your emails, stored in Cloudflare R2</p>
                </div>

                {/* Filter tabs */}
                <div className="px-4 pb-4 shrink-0 flex items-center gap-2 flex-wrap">
                    {FILTER_OPTIONS.map(({ key, label }) => {
                        const count = counts[key] ?? 0;
                        const isActive = filter === key;
                        return (
                            <button
                                key={key}
                                onClick={() => { setFilter(key); setSelected(null); }}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                                    isActive
                                        ? "bg-[#1C1917] text-white"
                                        : "bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]"
                                }`}
                            >
                                {label}
                                <span className={`text-[12px] tabular-nums ${isActive ? "text-white/60" : "text-[#A8A29E]"}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* List */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Table header */}
                        <div className="px-4 md:px-6 py-2 grid grid-cols-[1fr_36px] md:grid-cols-[1fr_180px_100px_80px_36px] gap-3 border-y border-[#E7E5E4] bg-[#FAFAF9] shrink-0">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]">File</span>
                            <span className="hidden md:block text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]">From</span>
                            <span className="hidden md:block text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]">Received</span>
                            <span className="hidden md:block text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]">Size</span>
                            <span />
                        </div>

                        {/* Rows */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center gap-3">
                                    <HugeiconsIcon icon={Loading03Icon} size={22} className="animate-spin text-[#A8A29E]" />
                                    <p className="text-[13px] text-[#78716C]">Loading vault…</p>
                                </div>
                            ) : error ? (
                                <div className="py-20 text-center">
                                    <p className="text-[14px] text-[#DC2626] font-medium">Failed to load vault.</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="py-20 flex flex-col items-center gap-3">
                                    <HugeiconsIcon icon={Archive01Icon} size={28} className="text-[#D4D0CE]" />
                                    <p className="text-[13px] text-[#78716C]">
                                        {all.length === 0
                                            ? "No attachments yet. They appear here automatically when emails arrive."
                                            : "No files match this filter."}
                                    </p>
                                </div>
                            ) : (
                                filtered.map((item) => {
                                    const fileType = getFileType(item.contentType, item.filename);
                                    const { bg } = FILE_CONFIG[fileType];
                                    const isSelected = selected?.id === item.id;
                                    const senderName = formatDate(item.emailReceivedAt);

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelected((p) => (p?.id === item.id ? null : item))}
                                            className={`px-4 md:px-6 py-3.5 grid grid-cols-[1fr_36px] md:grid-cols-[1fr_180px_100px_80px_36px] gap-3 items-center border-b border-[#F5F5F4] cursor-pointer transition-colors group ${
                                                isSelected
                                                    ? "bg-[#F5F5F4] border-l-2 border-l-[#1C1917] pl-[14px] md:pl-[22px]"
                                                    : "hover:bg-[#FAFAF9]"
                                            }`}
                                        >
                                            {/* File name + icon */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 flex items-center justify-center rounded-md shrink-0" style={{ background: bg }}>
                                                    <FileIcon type={fileType} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[14px] text-[#1C1917] font-medium truncate">{item.filename}</p>
                                                    <p className="text-[11px] text-[#A8A29E] truncate mt-0.5">{formatDate(item.emailReceivedAt)}</p>
                                                </div>
                                            </div>

                                            {/* Sender — desktop only */}
                                            <div className="hidden md:flex items-center gap-2 min-w-0">
                                                <div className="w-6 h-6 rounded-full bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center shrink-0">
                                                    <span className="text-[9px] font-semibold text-[#78716C] uppercase">
                                                        {senderName.charAt(0)}
                                                    </span>
                                                </div>
                                                <span className="text-[13px] text-[#57534E] truncate">{senderName}</span>
                                            </div>

                                            {/* Date — desktop only */}
                                            <span className="hidden md:block text-[12px] text-[#78716C]">
                                                {format(new Date(item.emailReceivedAt), "d MMM")}
                                            </span>

                                            {/* Size — desktop only */}
                                            <span className="hidden md:block text-[13px] text-[#78716C]">{formatSize(item.size)}</span>

                                            {/* Arrow */}
                                            <div className="flex justify-end">
                                                <HugeiconsIcon
                                                    icon={ArrowRight01Icon}
                                                    size={15}
                                                    className={`transition-colors ${isSelected ? "text-[#1C1917]" : "text-[#D4D0CE] group-hover:text-[#A8A29E]"}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Detail panel */}
                    <AnimatePresence>
                        {selected && (
                            <AttachmentPanel
                                key={selected.id}
                                item={selected}
                                onClose={() => setSelected(null)}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
}
