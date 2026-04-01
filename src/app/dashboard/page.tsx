"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, CommandIcon, Loading02Icon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { DriveFilesTab } from "@/components/DriveFilesTab";

export default function DashboardPage() {
    const [emails, setEmails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"All Sources" | "Gmail" | "Drive" | "Calendar">("All Sources");

    useEffect(() => {
        fetch("/api/emails?limit=20")
            .then((r) => r.json())
            .then((data) => {
                if (data.emails) {
                    setEmails(data.emails);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout>
            <div className="min-h-full pb-20">
                <div className="px-6 pt-6 space-y-6 max-w-4xl mx-auto">
                    {/* Filters Row */}
                    <div className="flex items-center gap-6 border-b border-[#E7E5E4] pb-3">
                        <button 
                            onClick={() => setActiveTab("All Sources")}
                            className={`text-[13px] font-medium transition-colors ${activeTab === "All Sources" ? "text-[#1C1917] pb-3 -mb-3 border-b-2 border-[#1C1917]" : "text-[#78716C] hover:text-[#1C1917]"}`}
                        >
                            All Sources
                        </button>
                        <button 
                            onClick={() => setActiveTab("Gmail")}
                            className={`flex items-center gap-2 text-[13px] font-medium transition-colors ${activeTab === "Gmail" ? "text-[#1C1917] pb-3 -mb-3 border-b-2 border-[#1C1917]" : "text-[#78716C] hover:text-[#1C1917]"}`}
                        >
                            <img src="https://cdn.brandfetch.io/gmail.com/icon/theme/dark/fallback/transparent" alt="Gmail" className="w-4 h-4 object-contain" />
                            Gmail
                        </button>
                        <button 
                            onClick={() => setActiveTab("Drive")}
                            className={`flex items-center gap-2 text-[13px] font-medium transition-colors ${activeTab === "Drive" ? "text-[#1C1917] pb-3 -mb-3 border-b-2 border-[#1C1917]" : "text-[#78716C] hover:text-[#1C1917]"}`}
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Drive" className="w-4 h-4" />
                            Drive
                        </button>
                        <button 
                            onClick={() => setActiveTab("Calendar")}
                            className={`flex items-center gap-2 text-[13px] font-medium transition-colors ${activeTab === "Calendar" ? "text-[#1C1917] pb-3 -mb-3 border-b-2 border-[#1C1917]" : "text-[#78716C] hover:text-[#1C1917]"}`}
                        >
                            <img src="https://cdn.brandfetch.io/google.com/icon/theme/dark/fallback/transparent" alt="Calendar" className="w-4 h-4 object-contain" />
                            Calendar
                        </button>
                    </div>

                    {/* Timeline Feed */}
                    <div>
                        {activeTab === "Drive" ? (
                            <div>
                                <h3 className="text-[11px] font-semibold text-[#A8A29E] tracking-widest uppercase mb-4">DRIVE FILES</h3>
                                <DriveFilesTab />
                            </div>
                        ) : activeTab === "Calendar" ? (
                            <div>
                                <h3 className="text-[11px] font-semibold text-[#A8A29E] tracking-widest uppercase mb-4">UPCOMING SECONDS</h3>
                                <p className="text-[13px] text-[#A8A29E]">Calendar syncing is processing...</p>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-[11px] font-semibold text-[#A8A29E] tracking-widest uppercase mb-4">TODAY</h3>
                                <div className="space-y-4">
                                    {loading ? (
                                        <p className="text-[13px] text-[#A8A29E] flex items-center gap-2">
                                            <HugeiconsIcon icon={Loading02Icon} size={14} className="animate-spin" /> Fetching timeline...
                                        </p>
                                    ) : emails.length > 0 ? (
                                        emails.map((email) => {
                                            const timeStr = email.receivedAt ? new Date(email.receivedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : "";
                                            const senderInitial = (email.sender || "U").charAt(0).toUpperCase();
                                            
                                            return (
                                                <div key={email.id} className="bg-white border border-[#E7E5E4] rounded-lg p-3 hover:border-[#D6D3D1] transition-colors relative flex gap-3 group items-center">
                                                    {/* Avatar */}
                                                    <div className="w-8 h-8 rounded-full bg-[#F5F5F4] text-[#78716C] font-semibold text-[13px] flex items-center justify-center shrink-0">
                                                        {senderInitial}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0 pr-24 relative">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-[13px] font-semibold text-[#1C1917] truncate max-w-[160px]">
                                                                {email.senderName || email.sender?.split('<')[0]?.trim() || "Unknown"}
                                                            </span>
                                                            <span className="text-[13px] font-medium text-[#1C1917] truncate">
                                                                {email.subject}
                                                            </span>
                                                        </div>
                                                        <p className="text-[13px] text-[#78716C] truncate">
                                                            {email.snippet?.replace(/&#39;/g, "'").replace(/&quot;/g, '"')}
                                                        </p>
                                                        
                                                        {/* Absolute Time & Icon Badge */}
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                                            <span className="text-[12px] text-[#A8A29E] whitespace-nowrap">{timeStr}</span>
                                                            <img src="https://cdn.brandfetch.io/gmail.com/icon/theme/dark/fallback/transparent" alt="Gmail" className="w-4 h-4 object-contain opacity-50 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-[13px] text-[#A8A29E]">No activity today.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
