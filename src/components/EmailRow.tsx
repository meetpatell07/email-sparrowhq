"use client";

import { useRouter } from "next/navigation";
import { format, isToday } from "date-fns";
import { GmailEmail } from "@/lib/gmail";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { classifyIndividualEmail } from "@/app/actions";

interface EmailRowProps {
  email: GmailEmail;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  personal: { bg: "bg-blue-100", text: "text-blue-700" },
  invoice: { bg: "bg-green-100", text: "text-green-700" },
  client: { bg: "bg-purple-100", text: "text-purple-700" },
  urgent: { bg: "bg-red-100", text: "text-red-700" },
  marketing: { bg: "bg-pink-100", text: "text-pink-700" },
  notification: { bg: "bg-yellow-100", text: "text-yellow-700" },
};

export function EmailRow({ email }: EmailRowProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(!email.category && !email.isProcessed);
  const [currentCategory, setCurrentCategory] = useState(email.category);

  useEffect(() => {
    async function autoClassify() {
      if (!email.category && !email.isProcessed) {
        try {
          const result = await classifyIndividualEmail(
            email.gmailId,
            email.subject || "",
            email.snippet || "",
            email.receivedAt
          );
          if (result.success) {
            setCurrentCategory(result.category);
          }
        } catch (error) {
          console.error("Failed to auto-classify email:", error);
        } finally {
          setIsProcessing(false);
        }
      }
    }
    autoClassify();
  }, [email]);

  const handleClick = () => {
    router.push(`/dashboard/email/${email.gmailId}`);
  };

  const parseSenderName = (sender: string) => {
    if (!sender) return "Unknown";

    const match = sender.match(/^(.+?)\s*<(.+?)>$|^(.+)$/);
    if (match) {
      let name: string;
      if (match[3]) {
        name = match[3];
      } else {
        name = match[1].trim();
      }
      return name.replace(/^"(.+)"$/, "$1");
    }
    return sender;
  };

  const name = parseSenderName(email.sender || "");
  const category = currentCategory || "personal";
  const isUrgent = category === "urgent";
  const colors = categoryColors[category] || categoryColors.personal;

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 group border border-transparent hover:border-gray-100"
    >
      {/* Sender & Subject */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name || "-"}</p>
        <p className="text-sm text-gray-500 truncate">
          {email.subject || "(No Subject)"}
        </p>
      </div>

      {/* Category Badge */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isProcessing ? (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 flex items-center gap-1.5 shadow-sm">
            <Loader2 className="w-3 h-3 animate-spin" />
            Classifying...
          </span>
        ) : (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${colors.bg} ${colors.text} shadow-sm`}>
            {category}
          </span>
        )}
      </div>

      {/* Urgency Indicator */}
      <div className="w-6 flex-shrink-0 flex justify-center">
        {isUrgent && !isProcessing && (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
      </div>

      {/* Date */}
      <div className="text-gray-400 text-xs font-medium w-16 text-right flex-shrink-0">
        {isToday(email.receivedAt)
          ? format(email.receivedAt, "h:mm a")
          : format(email.receivedAt, "d MMM")}
      </div>
    </div>
  );
}
