"use client";

import { Sidebar } from "@/components/Sidebar";
import { AIChatPanel } from "@/components/AIChatPanel";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Cancel01Icon,
    Search01Icon,
    CommandIcon,
    Menu01Icon,
    Home01Icon,
    Mail01Icon,
    Archive01Icon,
    CheckmarkSquare01Icon,
    Settings01Icon,
} from "@hugeicons/core-free-icons";
import { SparrowMark } from "@/components/landing/Logo";
import Link from "next/link";
import { cn } from "@/lib/utils";

const mobileNav = [
    { name: "Home",     icon: Home01Icon,             href: "/dashboard" },
    { name: "Emails",   icon: Mail01Icon,              href: "/dashboard/emails" },
    { name: "Vault",    icon: Archive01Icon,           href: "/dashboard/vault" },
    { name: "Drafts",   icon: CheckmarkSquare01Icon,   href: "/dashboard/drafts" },
    { name: "Settings", icon: Settings01Icon,          href: "/dashboard/settings" },
];

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isChatOpen, setIsChatOpen]       = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname  = usePathname();
    const segments  = pathname.split("/").filter(Boolean);
    const currentPage = segments[segments.length - 1] === "dashboard"
        ? "overview"
        : (segments[segments.length - 1] || "overview");
    const title = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    return (
        <div className="flex h-screen bg-[#FAFAF9] overflow-hidden">

            {/* ── Desktop sidebar ─────────────────────────────────────────── */}
            <div className="hidden md:block shrink-0">
                <Sidebar />
            </div>

            {/* ── Mobile sidebar drawer ────────────────────────────────────── */}
            {isSidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="fixed left-0 top-0 h-full z-50 md:hidden shadow-xl">
                        <Sidebar onClose={() => setIsSidebarOpen(false)} />
                    </div>
                </>
            )}

            {/* ── Main area ───────────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Header */}
                <header className="h-[52px] bg-white border-b border-[#E7E5E4] flex items-center justify-between px-4 shrink-0 z-10 w-full">

                    {/* Left: hamburger (mobile) + breadcrumb */}
                    <div className="flex items-center gap-2 min-w-0">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F5F5F4] transition-colors md:hidden shrink-0"
                            aria-label="Open menu"
                        >
                            <HugeiconsIcon icon={Menu01Icon} size={18} className="text-[#57534E]" />
                        </button>
                        <span className="text-[11px] font-heading font-medium text-[#78716C] uppercase tracking-wider hidden sm:inline-block">EmailHQ</span>
                        <span className="text-[#E7E5E4] hidden sm:inline-block">/</span>
                        <span className="text-[11px] font-medium text-[#1C1917] uppercase tracking-wider truncate">{title}</span>
                    </div>

                    {/* Centre: search bar (hidden on mobile) */}
                    <div className="hidden sm:flex flex-1 justify-center px-4">
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

                    {/* Right: AI chat toggle (always) */}
                    <div className="flex items-center shrink-0">
                        <button
                            onClick={() => setIsChatOpen((v) => !v)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F5F5F4] transition-colors"
                            aria-label="Toggle AI assistant"
                        >
                            <SparrowMark size={20} />
                        </button>
                    </div>
                </header>

                {/* Scrollable page content — bottom padding reserves space for mobile nav */}
                <div
                    className="flex-1 overflow-y-auto no-scrollbar bg-[#FAFAF9] relative w-full pb-16 md:pb-0"
                    data-lenis-prevent="true"
                >
                    {children}
                </div>

                {/* ── Mobile bottom navigation ─────────────────────────────── */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E7E5E4] flex items-stretch z-30">
                    {mobileNav.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex-1 flex flex-col items-center justify-center gap-1"
                            >
                                <HugeiconsIcon
                                    icon={item.icon}
                                    size={20}
                                    className={isActive ? "text-[#1C1917]" : "text-[#A8A29E]"}
                                />
                                <span className={cn(
                                    "text-[10px] font-medium",
                                    isActive ? "text-[#1C1917]" : "text-[#A8A29E]"
                                )}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </main>

            {/* ── AI chat panel ────────────────────────────────────────────── */}
            {isChatOpen && (
                <>
                    {/* Mobile backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 z-40 md:hidden"
                        onClick={() => setIsChatOpen(false)}
                    />
                    <aside className={cn(
                        "flex flex-col bg-white border-l border-[#E7E5E4] shrink-0",
                        // mobile: slide in from right as fixed overlay
                        "fixed right-0 top-0 h-full w-[min(360px,100vw)] z-50",
                        // desktop: static side panel
                        "md:relative md:w-[340px] md:h-screen md:z-auto"
                    )}>
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
                </>
            )}
        </div>
    );
}
