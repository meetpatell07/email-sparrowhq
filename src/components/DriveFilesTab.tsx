"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowUpRight01Icon,
    PlusSignIcon,
    Loading02Icon,
    File01Icon,
    FileSpreadsheetIcon,
} from "@hugeicons/core-free-icons";

type FileCategory = "doc" | "sheet" | "slide" | "pdf" | "other";

const CATEGORY_CONFIG: Record<FileCategory, { label: string; color: string; bg: string }> = {
    doc:   { label: "Doc",   color: "#4285F4", bg: "#EBF3FF" },
    sheet: { label: "Sheet", color: "#0F9D58", bg: "#E6F4ED" },
    slide: { label: "Slide", color: "#F4B400", bg: "#FEF7E0" },
    pdf:   { label: "PDF",   color: "#EA4335", bg: "#FDECEA" },
    other: { label: "File",  color: "#78716C", bg: "#F5F5F4" },
};

function getCategory(mimeType: string): FileCategory {
    if (mimeType?.includes("document") || mimeType?.includes("word") || mimeType === "text/plain") return "doc";
    if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel") || mimeType?.includes("csv")) return "sheet";
    if (mimeType?.includes("presentation") || mimeType?.includes("powerpoint")) return "slide";
    if (mimeType === "application/pdf") return "pdf";
    return "other";
}

function FileTypeIcon({ category, size = 16 }: { category: FileCategory; size?: number }) {
    const { color } = CATEGORY_CONFIG[category];
    return (
        <HugeiconsIcon
            icon={category === "sheet" ? FileSpreadsheetIcon : File01Icon}
            size={size}
            style={{ color }}
        />
    );
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DriveFilesTab({ viewMode = "grid" }: { viewMode?: "list" | "grid" }) {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDrafting, setIsDrafting] = useState(false);
    const [draftFile, setDraftFile] = useState<any | null>(null);
    const [instructions, setInstructions] = useState("");
    const [recipient, setRecipient] = useState("");

    useEffect(() => {
        fetch("/api/drive")
            .then(res => res.json())
            .then(data => {
                if (data.files) setFiles(data.files);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleCreateDraft = async () => {
        if (!draftFile || !instructions || !recipient) return;
        setIsDrafting(true);
        try {
            const res = await fetch("/api/drafts/from-file", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileId: draftFile.id, instructions, recipient }),
            });
            if (res.ok) {
                alert("AI Draft built and saved to Gmail Drafts!");
                setDraftFile(null);
                setInstructions("");
                setRecipient("");
            } else {
                alert("Failed to create draft");
            }
        } catch {
            alert("Error constructing AI draft");
        } finally {
            setIsDrafting(false);
        }
    };

    if (loading) {
        return (
            <div className="text-[#A8A29E] text-[13px] flex items-center gap-2 mt-8">
                <HugeiconsIcon icon={Loading02Icon} size={14} className="animate-spin" />
                Fetching your Drive documents...
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="p-8 text-center text-[13px] text-[#A8A29E]">
                No files found in Google Drive. Ensure you've re-authenticated to grant Drive access.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* AI Draft modal */}
            {draftFile && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg border border-[#E7E5E4]">
                        <h3 className="text-[18px] font-semibold text-[#1C1917] mb-1">Create AI Draft</h3>
                        <p className="text-[13px] text-[#A8A29E] mb-6">Attaching &lsquo;{draftFile.name}&rsquo;</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[12px] font-medium text-[#78716C] mb-1">Send To (Email Address)</label>
                                <input
                                    type="email"
                                    value={recipient}
                                    onChange={e => setRecipient(e.target.value)}
                                    placeholder="client@company.com"
                                    className="w-full h-10 px-3 rounded-lg border border-[#E7E5E4] bg-white text-[14px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#78716C] mb-1">Draft Instructions</label>
                                <textarea
                                    value={instructions}
                                    onChange={e => setInstructions(e.target.value)}
                                    placeholder="Briefly explain what the attached document is..."
                                    className="w-full h-24 p-3 rounded-lg border border-[#E7E5E4] bg-white text-[14px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917] resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    onClick={() => setDraftFile(null)}
                                    className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#78716C] hover:bg-[#F5F5F4] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateDraft}
                                    disabled={isDrafting || !recipient || !instructions}
                                    className="px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-[#1C1917] hover:bg-[#292524] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isDrafting ? "Drafting..." : "Generate & Attach"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── GRID VIEW ── */}
            {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {files.map((file) => {
                        const category = getCategory(file.mimeType);
                        const { bg, color } = CATEGORY_CONFIG[category];
                        return (
                            <div
                                key={file.id}
                                className="group border border-[#E7E5E4] rounded-xl p-3.5 hover:border-[#D6D3D1] transition-all bg-white hover:shadow-sm flex flex-col gap-3"
                            >
                                {/* Icon + open link */}
                                <div className="flex items-start justify-between">
                                    <div
                                        className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0"
                                        style={{ background: bg }}
                                    >
                                        <FileTypeIcon category={category} size={18} />
                                    </div>
                                    <a
                                        href={file.webViewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} className="text-[#A8A29E] hover:text-[#1C1917]" />
                                    </a>
                                </div>

                                {/* Name */}
                                <p className="text-[12px] font-medium text-[#1C1917] line-clamp-2 leading-snug flex-1">
                                    {file.name}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-[11px] font-semibold" style={{ color }}>
                                        {CATEGORY_CONFIG[category].label}
                                    </span>
                                    <button
                                        onClick={() => setDraftFile(file)}
                                        className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-[#F5F5F4] text-[#1C1917] hover:bg-[#E7E5E4] text-[9px] font-bold uppercase tracking-wider transition-colors"
                                    >
                                        <HugeiconsIcon icon={PlusSignIcon} size={9} />
                                        Select
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── LIST VIEW ── */}
            {viewMode === "list" && (
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden bg-white">
                    {files.map((file, i) => {
                        const category = getCategory(file.mimeType);
                        const { color } = CATEGORY_CONFIG[category];
                        return (
                            <div
                                key={file.id}
                                className={`flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAF9] transition-colors group ${i !== 0 ? "border-t border-[#F5F5F4]" : ""}`}
                            >
                                {/* Icon */}
                                <div className="w-7 h-7 flex items-center justify-center rounded-md bg-[#F5F5F4] shrink-0">
                                    <FileTypeIcon category={category} size={15} />
                                </div>

                                {/* Name */}
                                <span className="flex-1 text-[13px] font-medium text-[#1C1917] truncate min-w-0">
                                    {file.name}
                                </span>

                                {/* Type + date */}
                                <span className="hidden sm:block text-[12px] font-medium shrink-0" style={{ color }}>
                                    {CATEGORY_CONFIG[category].label}
                                </span>
                                <span className="hidden sm:block text-[12px] text-[#A8A29E] w-16 text-right shrink-0">
                                    {formatDate(file.modifiedTime)}
                                </span>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        onClick={() => setDraftFile(file)}
                                        className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 px-2 py-0.5 rounded bg-[#F5F5F4] text-[#1C1917] hover:bg-[#E7E5E4] text-[9px] font-bold uppercase tracking-wider transition-all"
                                    >
                                        <HugeiconsIcon icon={PlusSignIcon} size={9} />
                                        Select
                                    </button>
                                    <a
                                        href={file.webViewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="text-[#A8A29E] hover:text-[#1C1917]" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
