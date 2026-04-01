"use client";

import { Sidebar } from "@/components/Sidebar";
import { AIChatPanel } from "@/components/AIChatPanel";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { BubbleChatIcon, Cancel01Icon, Search01Icon, CommandIcon } from "@hugeicons/core-free-icons";
import { SparrowMark } from "@/components/landing/Logo";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isChatOpen, setIsChatOpen] = useState(true);
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);
    const currentPage = segments[segments.length - 1] === 'dashboard' ? 'overview' : (segments[segments.length - 1] || "overview");
    const title = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    return (
        <div className="flex h-screen bg-[#FAFAF9] overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-[52px] bg-white border-b border-[#E7E5E4] flex items-center justify-between px-5 shrink-0 z-10 w-full relative">
                    <div className="w-1/3 flex items-center gap-2">
                        <span className="text-[11px] font-heading font-medium text-[#78716C] uppercase tracking-wider hidden sm:inline-block">EmailHQ</span>
                        <span className="text-[#E7E5E4] hidden sm:inline-block">/</span>
                        <span className="text-[11px] font-medium text-[#1C1917] uppercase tracking-wider">{title}</span>
                    </div>
                    
                    <div className="w-1/3 flex justify-center">
                        <div className="relative w-full max-w-[400px]">
                            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                                <HugeiconsIcon icon={Search01Icon} size={14} className="text-[#A8A29E]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search EmailHQ..."
                                className="w-full h-8 pl-8 pr-10 rounded-md bg-[#F5F5F4] border border-transparent text-[13px] placeholder:text-[#A8A29E] focus:outline-none focus:bg-white focus:border-[#D6D3D1] focus:ring-1 focus:ring-[#D6D3D1] transition-all"
                            />
                            <div className="absolute inset-y-0 right-1.5 flex items-center pointer-events-none">
                                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] bg-white border border-[#E7E5E4] shadow-sm">
                                    <HugeiconsIcon icon={CommandIcon} size={10} className="text-[#A8A29E]" />
                                    <span className="text-[10px] font-medium text-[#A8A29E]">K</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-1/3 flex justify-end"></div>
                </header>

                <div className="h-[calc(100vh-52px)] overflow-y-auto no-scrollbar bg-[#FAFAF9] relative w-full" data-lenis-prevent="true">
                    {children}
                </div>
            </main>

            {isChatOpen ? (
                <aside className="w-[340px] h-screen flex flex-col bg-white border-l border-[#E7E5E4] shrink-0">
                    <div className="h-16 flex items-center justify-between px-5 border-b border-[#E7E5E4] shrink-0">
                        <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-[#1C1917] rounded-full flex items-center justify-center">
                            <SparrowMark size={18} color="white" />
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
                    className="fixed bottom-6 right-6 w-12 h-12 bg-[#1C1917] rounded-full flex items-center justify-center shadow-md hover:bg-[#292524] transition-colors"
                    aria-label="Open AI chat"
                >
                    <SparrowMark size={24} color="white" />
                </button>
            )}
        </div>
    );
}
