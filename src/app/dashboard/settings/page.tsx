"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon, Mail01Icon, BubbleChatIcon, UserCircleIcon } from "@hugeicons/core-free-icons";

const sections = [
    {
        icon: UserCircleIcon,
        title: "Account",
        description: "Manage your profile and connected Google account",
        accent: "#0284C7",
    },
    {
        icon: Mail01Icon,
        title: "Email Sync",
        description: "Configure how often emails are fetched and classified",
        accent: "#EA580C",
    },
    {
        icon: BubbleChatIcon,
        title: "AI Preferences",
        description: "Choose your AI provider and model settings",
        accent: "#7C3AED",
    },
    {
        icon: Settings01Icon,
        title: "Notifications",
        description: "Control alerts for urgent emails and new drafts",
        accent: "#059669",
    },
];

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <header className="h-16 flex items-center px-6 border-b border-[#E7E5E4] bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[#78716C] uppercase tracking-wider">SparrowHQ</span>
                    <span className="text-[#E7E5E4]">/</span>
                    <span className="text-[11px] font-medium text-[#1C1917] uppercase tracking-wider">Settings</span>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-[#FAFAF9] no-scrollbar">
                <div className="p-6 max-w-3xl mx-auto">

                    <div className="mb-4">
                        <h1 className="text-[22px] font-semibold text-[#1C1917]">Settings</h1>
                        <p className="text-[13px] text-[#78716C] mt-1">Manage your account and application preferences</p>
                    </div>

                    <div className="bg-white border border-[#E7E5E4] rounded-[2px] overflow-hidden">
                        {sections.map((s, i) => (
                            <button
                                key={s.title}
                                className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAF9] transition-colors text-left ${
                                    i < sections.length - 1 ? "border-b border-[#E7E5E4]" : ""
                                }`}
                            >
                                <div
                                    className="w-9 h-9 rounded-[2px] flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${s.accent}18` }}
                                >
                                    <HugeiconsIcon icon={s.icon} size={17} style={{ color: s.accent }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-medium text-[#1C1917]">{s.title}</p>
                                    <p className="text-[13px] text-[#78716C] mt-0.5">{s.description}</p>
                                </div>
                                <span className="text-[#E7E5E4] text-lg">›</span>
                            </button>
                        ))}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
