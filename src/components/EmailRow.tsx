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

const categoryStyles: Record<string, { bg: string; text: string }> = {
    personal:     { bg: "bg-[#EFF6FF]", text: "text-[#1D4ED8]" },
    invoice:      { bg: "bg-[#ECFDF5]", text: "text-[#059669]" },
    client:       { bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]" },
    urgent:       { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]" },
    marketing:    { bg: "bg-[#FFF1F2]", text: "text-[#BE123C]" },
    notification: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]" },
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
    const [isProcessing, setIsProcessing] = useState(!email.category && !email.isProcessed);
    const [currentCategory, setCurrentCategory] = useState(email.category);

    useEffect(() => {
        if (!email.category && !email.isProcessed) {
            classifyIndividualEmail(
                email.gmailId,
                email.subject || "",
                email.snippet || "",
                email.receivedAt
            )
                .then((result) => {
                    if (result.success) setCurrentCategory(result.category);
                })
                .catch(console.error)
                .finally(() => setIsProcessing(false));
        }
    }, [email]);

    const category = currentCategory || "personal";
    const isUrgent = category === "urgent";
    const styles = categoryStyles[category] ?? categoryStyles.personal;
    const name = parseSenderName(email.sender || "");
    const dateLabel = isToday(email.receivedAt)
        ? format(email.receivedAt, "h:mm a")
        : format(email.receivedAt, "d MMM");

    return (
        <div
            onClick={() => router.push(`/dashboard/email/${email.gmailId}`)}
            className="flex items-center gap-4 px-4 py-3 border-b border-[#E7E5E4] last:border-b-0 hover:bg-[#FAFAF9] cursor-pointer transition-colors group"
        >
            {/* Urgent dot */}
            <div className="w-4 shrink-0 flex justify-center">
                {isUrgent && !isProcessing && (
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

            {/* Category badge */}
            <div className="shrink-0">
                {isProcessing ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-[2px] bg-[#F5F5F4] text-[#78716C]">
                        <HugeiconsIcon icon={Loading03Icon} size={11} className="animate-spin" />
                        Classifying
                    </span>
                ) : (
                    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-[2px] capitalize ${styles.bg} ${styles.text}`}>
                        {category}
                    </span>
                )}
            </div>

            {/* Date */}
            <span className="text-[12px] text-[#A8A29E] w-14 text-right shrink-0">{dateLabel}</span>
        </div>
    );
}
