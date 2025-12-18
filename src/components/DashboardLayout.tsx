"use client";

import { Sidebar } from "@/components/Sidebar";
import { AIChatPanel } from "@/components/AIChatPanel";
import { useState } from "react";
import { MessageSquare, X } from "lucide-react";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isChatOpen, setIsChatOpen] = useState(true);

    return (
        <div className="flex h-screen bg-white font-sans overflow-hidden">
            {/* Left: Sidebar */}
            <Sidebar />

            {/* Middle: Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {children}
            </main>

            {/* Right: AI Chat Panel */}
            {isChatOpen ? (
                <aside className="w-96 h-screen flex flex-col bg-gray-50 border-l border-gray-100">
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900">AI Assistant</span>
                        </div>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                    <AIChatPanel />
                </aside>
            ) : (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                    <MessageSquare className="w-6 h-6 text-white" />
                </button>
            )}
        </div>
    );
}
