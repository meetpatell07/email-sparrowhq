"use client";

import useSWR from "swr";
import { EmailRow } from "@/components/EmailRow";
import { GmailEmail } from "@/lib/gmail";
import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, Loading03Icon } from "@hugeicons/core-free-icons";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function EmailsPage() {
    const { data, error, isLoading } = useSWR<{ emails: GmailEmail[] }>(
        "/api/emails?limit=20",
        fetcher
    );

    const emails = (data?.emails ?? []).map((e) => ({
        ...e,
        receivedAt: new Date(e.receivedAt),
    }));

    return (
        <DashboardLayout>
            <header className="h-16 flex items-center justify-between px-6 border-b border-[#E7E5E4] bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[#78716C] uppercase tracking-wider">SparrowHQ</span>
                    <span className="text-[#E7E5E4]">/</span>
                    <span className="text-[11px] font-medium text-[#1C1917] uppercase tracking-wider">Emails</span>
                </div>
                {!isLoading && !error && (
                    <span className="text-[12px] text-[#A8A29E]">{emails.length} messages</span>
                )}
            </header>

            <div className="flex-1 overflow-y-auto bg-[#FAFAF9] no-scrollbar">
                <div className="p-6 max-w-5xl mx-auto">

                    <div className="mb-4">
                        <h1 className="text-[22px] font-semibold text-[#1C1917]">Recent Emails</h1>
                        <p className="text-[13px] text-[#78716C] mt-1">Fetched and classified by AI</p>
                    </div>

                    <div className="bg-white border border-[#E7E5E4] rounded-[2px] overflow-hidden">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center gap-3">
                                <HugeiconsIcon icon={Loading03Icon} size={22} className="animate-spin text-[#A8A29E]" />
                                <p className="text-[13px] text-[#78716C]">Loading your mailbox…</p>
                            </div>
                        ) : error ? (
                            <div className="py-20 text-center">
                                <p className="text-[14px] text-[#DC2626] font-medium">Failed to load emails.</p>
                                <p className="text-[13px] text-[#78716C] mt-1">Please try again.</p>
                            </div>
                        ) : emails.length === 0 ? (
                            <div className="py-20 flex flex-col items-center gap-3">
                                <HugeiconsIcon icon={Mail01Icon} size={28} className="text-[#E7E5E4]" />
                                <p className="text-[13px] text-[#78716C]">No emails found.</p>
                            </div>
                        ) : (
                            emails.map((email) => <EmailRow key={email.id} email={email} />)
                        )}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
