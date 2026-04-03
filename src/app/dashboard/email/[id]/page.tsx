"use client";

export const runtime = 'edge';

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Users, Reply } from "lucide-react";
import { format } from "date-fns";
import { GmailEmailDetail } from "@/lib/gmail";
import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EmailDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, error, isLoading } = useSWR<{ email: GmailEmailDetail }>(
    id ? `/api/emails/${id}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-3xl mx-auto">
          <div className="py-20 flex flex-col items-center gap-3">
            <HugeiconsIcon icon={Loading03Icon} size={22} className="animate-spin text-[#A8A29E]" />
            <p className="text-[13px] text-[#78716C]">Loading email…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data?.email) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[13px] text-[#78716C] hover:text-[#1C1917] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="bg-white border border-[#E7E5E4] rounded-lg p-8 text-center">
            <p className="text-[14px] font-medium text-[#DC2626] mb-2">Unable to load email</p>
            <p className="text-[13px] text-[#78716C]">
              {error?.message || "Email not found or has been deleted."}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const email = {
    ...data.email,
    receivedAt: new Date(data.email.receivedAt),
  };

  const parseSenderName = (sender: string) => {
    if (!sender) return "Unknown";
    const match = sender.match(/^(.+?)\s*<(.+?)>$|^(.+)$/);
    if (match) {
      const name = match[3] ?? match[1].trim();
      return name.replace(/^"(.+)"$/, "$1");
    }
    return sender;
  };

  const extractEmail = (sender: string) => {
    const match = sender.match(/<(.+?)>/);
    return match ? match[1] : sender;
  };

  return (
    <DashboardLayout>
      <div className="min-h-full pb-20 md:pb-6">
        <div className="p-4 md:p-6 max-w-3xl mx-auto">

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[13px] text-[#78716C] hover:text-[#1C1917] transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="bg-white border border-[#E7E5E4] rounded-lg overflow-hidden">
            {/* Email header */}
            <div className="p-4 md:p-6 border-b border-[#E7E5E4]">
              <h1 className="text-[18px] md:text-[22px] font-semibold text-[#1C1917] mb-4 leading-snug">
                {email.subject || "(No Subject)"}
              </h1>

              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-[#F5F5F4] flex items-center justify-center shrink-0 border border-[#E7E5E4]">
                  <span className="text-[14px] font-semibold text-[#78716C]">
                    {parseSenderName(email.sender).charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Sender info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[14px] font-semibold text-[#1C1917]">
                      {parseSenderName(email.sender)}
                    </span>
                    <span className="text-[12px] text-[#A8A29E] truncate">
                      &lt;{extractEmail(email.sender)}&gt;
                    </span>
                  </div>
                  <p className="text-[12px] text-[#78716C] mt-0.5">
                    to {parseSenderName(email.recipient)}
                  </p>
                </div>

                {/* Date — right-aligned, wraps below on tiny screens */}
                <span className="text-[12px] text-[#A8A29E] shrink-0 mt-0.5">
                  {format(email.receivedAt, "d MMM, h:mm a")}
                </span>
              </div>

              {/* CC / Reply-To */}
              {(email.cc || email.replyTo) && (
                <div className="mt-4 pt-4 border-t border-[#E7E5E4] space-y-2 text-[12px] text-[#78716C]">
                  {email.cc && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium">Cc:</span>
                      <span className="truncate">{email.cc}</span>
                    </div>
                  )}
                  {email.replyTo && (
                    <div className="flex items-center gap-2">
                      <Reply className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium">Reply-To:</span>
                      <span className="truncate">{email.replyTo}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-4 md:p-6">
              {email.htmlBody ? (
                <div
                  className="prose prose-sm max-w-none bg-white rounded text-[#1C1917] overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: email.htmlBody }}
                />
              ) : (
                <p className="whitespace-pre-wrap text-[14px] text-[#1C1917] leading-relaxed">
                  {email.body || email.snippet || "No content available."}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
