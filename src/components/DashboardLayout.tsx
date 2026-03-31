"use client";

import { Sidebar } from "@/components/Sidebar";
import { AIChatPanel } from "@/components/AIChatPanel";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { BubbleChatIcon, Cancel01Icon } from "@hugeicons/core-free-icons";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isChatOpen, setIsChatOpen] = useState(true);

    return (
        <div className="flex h-screen bg-[#FAFAF9] overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {children}
            </main>

            {isChatOpen ? (
                <aside className="w-[340px] h-screen flex flex-col bg-white border-l border-[#E7E5E4] shrink-0">
                    <div className="h-16 flex items-center justify-between px-5 border-b border-[#E7E5E4] shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-[#1C1917] rounded-md flex items-center justify-center">
                                <HugeiconsIcon icon={BubbleChatIcon} size={14} className="text-white" />
                            </div>
                            <span className="text-[14px] font-semibold text-[#1C1917]">AI Assistant</span>
                        </div>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F5F5F4] transition-colors"
                            aria-label="Close chat"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-[#78716C]" />
                        </button>
                    </div>
                    <AIChatPanel />
                </aside>
            ) : (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 w-12 h-12 bg-[#1C1917] rounded-md flex items-center justify-center shadow-md hover:bg-[#292524] transition-colors"
                    aria-label="Open AI chat"
                >
                    <HugeiconsIcon icon={BubbleChatIcon} size={18} className="text-white" />
                </button>
            )}
        </div>
    );
}
