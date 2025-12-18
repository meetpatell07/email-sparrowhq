"use client";

import useSWR from "swr";
import { DashboardLayout } from "@/components/DashboardLayout";
import { format } from "date-fns";
import { FileText, Mail, Check, X, ExternalLink, Loader2 } from "lucide-react";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const statusColors: Record<string, { bg: string; text: string }> = {
    pending_approval: { bg: "bg-yellow-100", text: "text-yellow-700" },
    approved: { bg: "bg-blue-100", text: "text-blue-700" },
    sent: { bg: "bg-green-100", text: "text-green-700" },
    rejected: { bg: "bg-red-100", text: "text-red-700" },
};

export default function DraftsPage() {
    const { data, error, isLoading, mutate } = useSWR<{ drafts: Draft[] }>(
        "/api/drafts",
        fetcher
    );
    const [discardingId, setDiscardingId] = useState<string | null>(null);

    const drafts = data?.drafts || [];

    const parseSenderName = (sender: string | null) => {
        if (!sender) return "Unknown";
        const match = sender.match(/^(.+?)\s*<(.+?)>$|^(.+)$/);
        if (match) {
            return match[3] || match[1].trim().replace(/^"(.+)"$/, "$1");
        }
        return sender;
    };

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
            <header className="h-16 flex items-center justify-between px-8 border-b border-gray-50 flex-shrink-0">
                <h1 className="text-xl font-semibold text-black">Auto-Drafts</h1>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="p-8 max-w-5xl mx-auto w-full">
                    <div className="mb-8">
                        <h2 className="text-2xl text-gray-900 font-bold mb-2">AI-Generated Drafts</h2>
                        <p className="text-gray-400 text-sm font-medium leading-none">
                            {drafts.length} drafts pending review
                        </p>
                    </div>

                    <section className="space-y-4 pb-8">
                        {isLoading ? (
                            <div className="py-20 text-center">
                                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-gray-400 font-medium">Loading drafts...</p>
                            </div>
                        ) : error ? (
                            <div className="py-20 text-center text-red-500 font-medium">
                                Failed to load drafts. Please try again.
                            </div>
                        ) : drafts.length === 0 ? (
                            <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium">No auto-drafts yet.</p>
                                <p className="text-gray-300 text-sm mt-1">Drafts will appear here when you receive client or urgent emails.</p>
                            </div>
                        ) : (
                            drafts.map((draft) => {
                                const colors = statusColors[draft.status] || statusColors.pending_approval;
                                const isDiscarding = discardingId === draft.id;
                                return (
                                    <div
                                        key={draft.id}
                                        className="p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200 bg-white"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900 truncate">
                                                        {parseSenderName(draft.emailSender)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {draft.emailSubject || "(No Subject)"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${colors.bg} ${colors.text}`}>
                                                    {draft.status.replace("_", " ")}
                                                </span>
                                                {draft.gmailDraftId && (
                                                    <a
                                                        href="https://mail.google.com/mail/u/0/#drafts"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                                        title="Open in Gmail"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4 mb-3">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                                                {draft.content}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">
                                                {draft.createdAt && format(new Date(draft.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                            </span>
                                            {draft.status === "pending_approval" && (
                                                <div className="flex items-center gap-2">
                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100 transition-colors">
                                                        <Check className="w-4 h-4" />
                                                        Approve & Send
                                                    </button>
                                                    <button
                                                        onClick={() => handleDiscard(draft.id)}
                                                        disabled={isDiscarding}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                                                    >
                                                        {isDiscarding ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <X className="w-4 h-4" />
                                                        )}
                                                        Discard
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
