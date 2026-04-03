"use client";

import useSWR from "swr";
import { DashboardLayout } from "@/components/DashboardLayout";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    CheckmarkSquare01Icon,
    Mail01Icon,
    Tick01Icon,
    Cancel01Icon,
    ArrowUpRight01Icon,
    Loading03Icon,
} from "@hugeicons/core-free-icons";
import { discardDraft } from "@/app/actions";
import { useState } from "react";

interface Draft {
    id: string;
    gmailDraftId: string | null;
    content: string;
    status: string;
    createdAt: string;
    emailId: string;
    emailSubject: string | null;
    emailSender: string | null;
    emailSnippet: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    pending_approval: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", label: "Pending" },
    approved:         { bg: "bg-[#EFF6FF]", text: "text-[#1D4ED8]", label: "Approved" },
    sent:             { bg: "bg-[#ECFDF5]", text: "text-[#059669]", label: "Sent" },
    rejected:         { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", label: "Rejected" },
};

function parseSenderName(sender: string | null): string {
    if (!sender) return "Unknown";
    const match = sender.match(/^(.+?)\s*<(.+?)>$|^(.+)$/);
    if (match) {
        const name = match[3] ?? match[1].trim();
        return name.replace(/^"(.+)"$/, "$1");
    }
    return sender;
}

export default function DraftsPage() {
    const { data, error, isLoading, mutate } = useSWR<{ drafts: Draft[] }>("/api/drafts", fetcher);
    const [discardingId, setDiscardingId] = useState<string | null>(null);

    const drafts = data?.drafts ?? [];

    const handleDiscard = async (draftId: string) => {
        setDiscardingId(draftId);
        try {
            await discardDraft(draftId);
            mutate();
        } catch (e) {
            console.error("Failed to discard draft:", e);
        } finally {
            setDiscardingId(null);
        }
    };

    return (
        <DashboardLayout>
            

            <div className="min-h-full pb-20">
                <div className="p-6 max-w-5xl mx-auto">

                    <div className="mb-4">
                        <h1 className="text-[22px] font-semibold text-[#1C1917]">AI-Generated Drafts</h1>
                        <p className="text-[13px] text-[#78716C] mt-1">Review and approve replies before they're sent</p>
                    </div>

                    <div className="space-y-3 pb-8">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center gap-3 bg-white border border-[#E7E5E4] rounded-[2px]">
                                <HugeiconsIcon icon={Loading03Icon} size={22} className="animate-spin text-[#A8A29E]" />
                                <p className="text-[13px] text-[#78716C]">Loading drafts…</p>
                            </div>
                        ) : error ? (
                            <div className="py-20 text-center bg-white border border-[#E7E5E4] rounded-[2px]">
                                <p className="text-[14px] font-medium text-[#DC2626]">Failed to load drafts.</p>
                            </div>
                        ) : drafts.length === 0 ? (
                            <div className="py-20 flex flex-col items-center gap-3 bg-white border border-[#E7E5E4] rounded-[2px]">
                                <HugeiconsIcon icon={CheckmarkSquare01Icon} size={28} className="text-[#E7E5E4]" />
                                <p className="text-[14px] font-medium text-[#1C1917]">No drafts yet</p>
                                <p className="text-[13px] text-[#78716C]">Drafts appear when you receive client or urgent emails.</p>
                            </div>
                        ) : (
                            drafts.map((draft) => {
                                const style = statusStyles[draft.status] ?? statusStyles.pending_approval;
                                const isDiscarding = discardingId === draft.id;

                                return (
                                    <div key={draft.id} className="bg-white border border-[#E7E5E4] rounded-[2px] p-5">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <HugeiconsIcon icon={Mail01Icon} size={14} className="text-[#A8A29E] shrink-0" />
                                                    <span className="text-[14px] font-medium text-[#1C1917] truncate">
                                                        {parseSenderName(draft.emailSender)}
                                                    </span>
                                                </div>
                                                <p className="text-[13px] text-[#78716C] truncate pl-[22px]">
                                                    {draft.emailSubject || "(No Subject)"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-[2px] ${style.bg} ${style.text}`}>
                                                    {style.label}
                                                </span>
                                                {draft.gmailDraftId && (
                                                    <a
                                                        href="https://mail.google.com/mail/u/0/#drafts"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F5F5F4] transition-colors"
                                                        title="Open in Gmail"
                                                    >
                                                        <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="text-[#A8A29E]" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Draft content */}
                                        <div className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-[2px] px-4 py-3 mb-3">
                                            <p className="text-[13px] text-[#1C1917] whitespace-pre-wrap line-clamp-4 leading-relaxed">
                                                {draft.content}
                                            </p>
                                        </div>

                                                        {/* Footer */}
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-[12px] text-[#A8A29E]">
                                                {draft.createdAt && format(new Date(draft.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                            </span>
                                            {draft.status === "pending_approval" && (
                                                <div className="flex items-center gap-2">
                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#ECFDF5] text-[#059669] text-[13px] font-medium hover:bg-[#D1FAE5] transition-colors">
                                                        <HugeiconsIcon icon={Tick01Icon} size={13} />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleDiscard(draft.id)}
                                                        disabled={isDiscarding}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FEF2F2] text-[#DC2626] text-[13px] font-medium hover:bg-[#FEE2E2] transition-colors disabled:opacity-50"
                                                    >
                                                        {isDiscarding
                                                            ? <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin" />
                                                            : <HugeiconsIcon icon={Cancel01Icon} size={13} />
                                                        }
                                                        Discard
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
