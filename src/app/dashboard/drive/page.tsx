"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    GoogleDriveIcon,
    File01Icon,
    FileSpreadsheetIcon,
    ArrowRight01Icon,
    Cancel01Icon,
    LinkSquare01Icon,
    SentIcon,
    Loading03Icon,
} from "@hugeicons/core-free-icons";

// ─── Types ───────────────────────────────────────────────────────────────────

type FileCategory = "doc" | "sheet" | "slide" | "pdf" | "other";

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink?: string;
    modifiedTime?: string;
    size?: string;
    quotaBytesUsed?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<FileCategory, { label: string; color: string; bg: string }> = {
    doc: { label: "Doc", color: "#4285F4", bg: "#EBF3FF" },
    sheet: { label: "Sheet", color: "#0F9D58", bg: "#E6F4ED" },
    slide: { label: "Slide", color: "#F4B400", bg: "#FEF7E0" },
    pdf: { label: "PDF", color: "#EA4335", bg: "#FDECEA" },
    other: { label: "File", color: "#78716C", bg: "#F5F5F4" },
};

const FILTERS: Array<{ key: FileCategory | "all"; label: string }> = [
    { key: "all", label: "All" },
    { key: "doc", label: "Docs" },
    { key: "sheet", label: "Sheets" },
    { key: "slide", label: "Slides" },
    { key: "pdf", label: "PDFs" },
    { key: "other", label: "Other" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCategory(mimeType: string): FileCategory {
    if (mimeType.includes("document") || mimeType.includes("word") || mimeType === "text/plain") return "doc";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return "sheet";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "slide";
    if (mimeType === "application/pdf") return "pdf";
    return "other";
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatSize(bytes?: string): string {
    const n = parseInt(bytes || "0", 10);
    if (!n) return "—";
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FileTypeIcon({ category, size = 18 }: { category: FileCategory; size?: number }) {
    const { color } = CATEGORY_CONFIG[category];
    return (
        <HugeiconsIcon
            icon={category === "sheet" ? FileSpreadsheetIcon : File01Icon}
            size={size}
            style={{ color }}
        />
    );
}

function TypeBadge({ category }: { category: FileCategory }) {
    const { label, color } = CATEGORY_CONFIG[category];
    return (
        <span className="text-[13px] font-medium" style={{ color }}>
            {label}
        </span>
    );
}

// ─── File Detail Panel ────────────────────────────────────────────────────────

function FilePanel({
    file,
    onClose,
}: {
    file: DriveFile;
    onClose: () => void;
}) {
    const category = getCategory(file.mimeType);
    const { label, color } = CATEGORY_CONFIG[category];
    const displaySize = formatSize(file.size || file.quotaBytesUsed);

    const handleSendAsEmail = () => {
        const subject = encodeURIComponent(`Sharing: ${file.name}`);
        const body = encodeURIComponent(
            `Hi,\n\nI wanted to share this file with you:\n\n${file.name}\n${file.webViewLink || ""}\n\nBest regards`
        );
        window.open(
            `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
            "_blank"
        );
    };

    return (
        <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-[320px] shrink-0 border-l border-[#E7E5E4] bg-white flex flex-col overflow-y-auto"
        >
            {/* Panel header */}
            <div className="flex items-start justify-between p-5 border-b border-[#E7E5E4]">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#F5F5F4] shrink-0">
                        <FileTypeIcon category={category} size={20} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-[#1C1917] leading-snug break-words">
                            {file.name}
                        </p>
                        <span className="text-[12px] font-medium" style={{ color }}>
                            {label}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="shrink-0 text-[#A8A29E] hover:text-[#57534E] transition-colors"
                    aria-label="Close panel"
                >
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>
            </div>

            {/* Metadata */}
            <div className="px-5 py-4 border-b border-[#E7E5E4] grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A8A29E] mb-1">
                        Modified
                    </p>
                    <p className="text-[14px] text-[#1C1917]">
                        {formatDate(file.modifiedTime)}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A8A29E] mb-1">
                        Size
                    </p>
                    <p className="text-[14px] text-[#1C1917]">{displaySize}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="p-5 space-y-2.5">
                <a
                    href={file.webViewLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 w-full px-4 py-3 rounded-lg border border-[#E7E5E4] text-[14px] font-medium text-[#1C1917] hover:bg-[#F5F5F4] transition-colors"
                >
                    <HugeiconsIcon icon={LinkSquare01Icon} size={17} className="text-[#57534E] shrink-0" />
                    Open in Google Drive
                </a>

                <button
                    onClick={handleSendAsEmail}
                    className="flex items-center gap-2.5 w-full px-4 py-3 rounded-lg bg-[#1C1917] text-[14px] font-medium text-white hover:bg-[#292524] transition-colors"
                >
                    <HugeiconsIcon icon={SentIcon} size={17} className="shrink-0" />
                    Send as email
                </button>
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DrivePage() {
    const [activeFilter, setActiveFilter] = useState<FileCategory | "all">("all");
    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);

    const { data, error, isLoading } = useSWR<{ files: DriveFile[] }>("/api/drive", fetcher);
    const files = data?.files ?? [];

    // Per-category counts for tab badges
    const counts = useMemo(() => {
        const result: Record<string, number> = { all: files.length };
        for (const f of files) {
            const cat = getCategory(f.mimeType);
            result[cat] = (result[cat] || 0) + 1;
        }
        return result;
    }, [files]);

    const filteredFiles = useMemo(() => {
        if (activeFilter === "all") return files;
        return files.filter((f) => getCategory(f.mimeType) === activeFilter);
    }, [files, activeFilter]);

    const handleRowClick = (file: DriveFile) => {
        setSelectedFile((prev) => (prev?.id === file.id ? null : file));
    };

    return (
        <DashboardLayout>
            <div className="h-full flex flex-col overflow-hidden">
                {/* Page header */}
                <div className="px-4 pt-4 pb-3 shrink-0">
                    <p className="text-[13px] text-[#78716C]">Your files, docs, sheets, and more</p>
                </div>

                {/* Filter tabs */}
                <div className="px-4 pb-4 shrink-0 flex items-center gap-2 flex-wrap">
                    {FILTERS.map(({ key, label }) => {
                        const count = counts[key] ?? 0;
                        const isActive = activeFilter === key;
                        return (
                            <button
                                key={key}
                                onClick={() => { setActiveFilter(key); setSelectedFile(null); }}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${isActive
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

                {/* Content: table + optional panel side-by-side */}
                <div className="flex flex-1 overflow-hidden">
                    {/* File list */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Table header */}
                        <div className="px-6 py-2 grid grid-cols-[1fr_100px_140px_96px_36px] gap-3 border-y border-[#E7E5E4] bg-[#FAFAF9] shrink-0">
                            {["Name", "Type", "Modified", "Size"].map((h) => (
                                <span
                                    key={h}
                                    className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]"
                                >
                                    {h}
                                </span>
                            ))}
                            <span />
                        </div>

                        {/* Rows */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center gap-3">
                                    <HugeiconsIcon
                                        icon={Loading03Icon}
                                        size={22}
                                        className="animate-spin text-[#A8A29E]"
                                    />
                                    <p className="text-[13px] text-[#78716C]">Loading Drive files…</p>
                                </div>
                            ) : error ? (
                                <div className="py-20 text-center">
                                    <p className="text-[14px] text-[#DC2626] font-medium">
                                        Failed to load Drive files.
                                    </p>
                                    <p className="text-[13px] text-[#78716C] mt-1">
                                        Make sure you have granted Drive access.
                                    </p>
                                </div>
                            ) : filteredFiles.length === 0 ? (
                                <div className="py-20 flex flex-col items-center gap-3">
                                    <HugeiconsIcon
                                        icon={GoogleDriveIcon}
                                        size={28}
                                        className="text-[#D4D0CE]"
                                    />
                                    <p className="text-[13px] text-[#78716C]">No files found.</p>
                                </div>
                            ) : (
                                filteredFiles.map((file) => {
                                    const category = getCategory(file.mimeType);
                                    const isSelected = selectedFile?.id === file.id;
                                    const sizeBytes = file.size || file.quotaBytesUsed;

                                    return (
                                        <div
                                            key={file.id}
                                            onClick={() => handleRowClick(file)}
                                            className={`px-6 py-3.5 grid grid-cols-[1fr_100px_140px_96px_36px] gap-3 items-center border-b border-[#F5F5F4] cursor-pointer transition-colors group ${isSelected
                                                ? "bg-[#F5F5F4] border-l-2 border-l-[#1C1917] pl-[22px]"
                                                : "hover:bg-[#FAFAF9]"
                                                }`}
                                        >
                                            {/* Name + icon */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[#F5F5F4] shrink-0">
                                                    <FileTypeIcon category={category} />
                                                </div>
                                                <span className="text-[14px] text-[#1C1917] font-medium truncate">
                                                    {file.name}
                                                </span>
                                            </div>

                                            {/* Type */}
                                            <TypeBadge category={category} />

                                            {/* Modified */}
                                            <span className="text-[13px] text-[#78716C]">
                                                {formatDate(file.modifiedTime)}
                                            </span>

                                            {/* Size */}
                                            <span className="text-[13px] text-[#78716C]">
                                                {formatSize(sizeBytes)}
                                            </span>

                                            {/* Arrow */}
                                            <div className="flex justify-end">
                                                <HugeiconsIcon
                                                    icon={ArrowRight01Icon}
                                                    size={15}
                                                    className={`transition-colors ${isSelected
                                                        ? "text-[#1C1917]"
                                                        : "text-[#D4D0CE] group-hover:text-[#A8A29E]"
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Slide-in detail panel */}
                    <AnimatePresence>
                        {selectedFile && (
                            <FilePanel
                                key={selectedFile.id}
                                file={selectedFile}
                                onClose={() => setSelectedFile(null)}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
}
