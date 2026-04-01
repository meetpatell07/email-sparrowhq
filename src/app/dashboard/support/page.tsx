"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { BubbleChatIcon, Mail01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

const options = [
    {
        icon: BubbleChatIcon,
        title: "Chat with AI",
        description: "Use the AI assistant on the right to get help with your inbox",
        action: "Open assistant",
        accent: "#7C3AED",
    },
    {
        icon: Mail01Icon,
        title: "Email support",
        description: "Reach our team at support@sparrowhq.com",
        action: "Send email",
        accent: "#EA580C",
    },
];

export default function SupportPage() {
    return (
        <DashboardLayout>
            

            <div className="min-h-full pb-20">
                <div className="p-6 max-w-3xl mx-auto">

                    <div className="mb-4">
                        <h1 className="text-[22px] font-semibold text-[#1C1917]">Support</h1>
                        <p className="text-[13px] text-[#78716C] mt-1">We're here to help</p>
                    </div>

                    <div className="space-y-3">
                        {options.map((opt) => (
                            <div key={opt.title} className="bg-white border border-[#E7E5E4] rounded-[2px] p-5 flex items-start gap-4">
                                <div
                                    className="w-9 h-9 rounded-[2px] flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${opt.accent}18` }}
                                >
                                    <HugeiconsIcon icon={opt.icon} size={17} style={{ color: opt.accent }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-medium text-[#1C1917]">{opt.title}</p>
                                    <p className="text-[13px] text-[#78716C] mt-0.5">{opt.description}</p>
                                </div>
                                <button className="flex items-center gap-1 text-[13px] font-medium text-[#1C1917] hover:text-[#78716C] transition-colors shrink-0">
                                    {opt.action}
                                    <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
