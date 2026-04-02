"use client";

import { useRouter } from "next/navigation";
import { format, isToday } from "date-fns";
import { GmailEmail } from "@/lib/gmail";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { classifyIndividualEmail } from "@/app/actions";

interface EmailRowProps {
    email: GmailEmail;
}

const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
    to_do:        { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]",  label: "To Do" },
    follow_up:    { bg: "bg-[#EFF6FF]", text: "text-[#1D4ED8]",  label: "Follow Up" },
    scheduled:    { bg: "bg-[#ECFDF5]", text: "text-[#059669]",  label: "Scheduled" },
    finance:      { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]",  label: "Finance" },
    work:         { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]",  label: "Work" },
    personal:     { bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]",  label: "Personal" },
    notification: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]",  label: "Notification" },
    marketing:    { bg: "bg-[#FFF1F2]", text: "text-[#BE123C]",  label: "Marketing" },
};

function parseSenderName(sender: string): string {
    if (!sender) return "Unknown";
    const match = sender.match(/^(.+?)\s*<(.+?)>$|^(.+)$/);
    if (match) {
        const name = match[3] ?? match[1].trim();
        return name.replace(/^"(.+)"$/, "$1");
    }
    return sender;
}

export function EmailRow({ email }: EmailRowProps) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(!email.categories?.length && !email.isProcessed);
    const [currentCategories, setCurrentCategories] = useState<string[]>(email.categories ?? []);

    useEffect(() => {
        if (!email.categories?.length && !email.isProcessed) {
            classifyIndividualEmail(
                email.gmailId,
                email.subject || "",
                email.snippet || "",
                email.receivedAt
            )
                .then((result) => {
                    if (result.success) setCurrentCategories(result.categories);
                })
                .catch(console.error)
                .finally(() => setIsProcessing(false));
        }
    }, [email]);

    const isActionRequired = currentCategories.includes("to_do");
    const name = parseSenderName(email.sender || "");
    const dateLabel = isToday(email.receivedAt)
        ? format(email.receivedAt, "h:mm a")
        : format(email.receivedAt, "d MMM");

    return (
        <div
            onClick={() => router.push(`/dashboard/email/${email.gmailId}`)}
            className="flex items-center gap-4 px-4 py-3 border-b border-[#E7E5E4] last:border-b-0 hover:bg-[#FAFAF9] cursor-pointer transition-colors group"
        >
            {/* Action dot */}
            <div className="w-4 shrink-0 flex justify-center">
                {isActionRequired && !isProcessing && (
                    <HugeiconsIcon icon={AlertCircleIcon} size={14} className="text-[#DC2626]" />
                )}
            </div>

            {/* Sender & Subject */}
            <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[#1C1917] truncate leading-snug">{name || "—"}</p>
                <p className="text-[13px] text-[#78716C] truncate leading-snug mt-0.5">
                    {email.subject || "(No Subject)"}
                </p>
            </div>

            {/* Category badges (up to 2) */}
            <div className="shrink-0 flex items-center gap-1">
                {isProcessing ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-[2px] bg-[#F5F5F4] text-[#78716C]">
                        <HugeiconsIcon icon={Loading03Icon} size={11} className="animate-spin" />
                        Classifying
                    </span>
                ) : currentCategories.length > 0 ? (
                    currentCategories.slice(0, 2).map((cat) => {
                        const style = categoryStyles[cat] ?? { bg: "bg-[#F5F5F4]", text: "text-[#78716C]", label: cat };
                        return (
                            <span
                                key={cat}
                                className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-[2px] ${style.bg} ${style.text}`}
                            >
                                {style.label}
                            </span>
                        );
                    })
                ) : null}
            </div>

            {/* Date */}
            <span className="text-[12px] text-[#A8A29E] w-14 text-right shrink-0">{dateLabel}</span>
        </div>
    );
}
