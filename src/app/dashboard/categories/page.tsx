"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tag01Icon, SparklesIcon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";

const categories = [
    { name: "Personal",     dot: "#1D4ED8", bg: "bg-[#EFF6FF]",  text: "text-[#1D4ED8]",  description: "Personal emails and correspondence" },
    { name: "Invoice",      dot: "#059669", bg: "bg-[#ECFDF5]",  text: "text-[#059669]",  description: "Bills, receipts, and payment requests" },
    { name: "Client",       dot: "#7C3AED", bg: "bg-[#F5F3FF]",  text: "text-[#7C3AED]",  description: "Communications from clients" },
    { name: "Urgent",       dot: "#DC2626", bg: "bg-[#FEF2F2]",  text: "text-[#DC2626]",  description: "Emails requiring immediate attention" },
    { name: "Marketing",    dot: "#BE123C", bg: "bg-[#FFF1F2]",  text: "text-[#BE123C]",  description: "Newsletters and promotional content" },
    { name: "Notification", dot: "#D97706", bg: "bg-[#FFFBEB]",  text: "text-[#D97706]",  description: "Automated updates and alerts" },
];

export default function CategoriesPage() {
    return (
        <DashboardLayout>
            

            <div className="min-h-full pb-20">
                <div className="p-6 max-w-3xl mx-auto">

                    <div className="mb-4">
                        <h1 className="text-[22px] font-semibold text-[#1C1917]">Email Categories</h1>
                        <p className="text-[13px] text-[#78716C] mt-1">AI automatically assigns one of these labels to each email</p>
                    </div>

                    {/* Info card */}
                    <div className="bg-white border border-[#E7E5E4] rounded-[2px] p-4 mb-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-[2px] bg-[#EA580C18] flex items-center justify-center shrink-0">
                            <HugeiconsIcon icon={SparklesIcon} size={16} className="text-[#EA580C]" />
                        </div>
                        <div>
                            <p className="text-[14px] font-medium text-[#1C1917]">Automatic Classification</p>
                            <p className="text-[13px] text-[#78716C] mt-0.5 leading-relaxed">
                                When you sync emails, the AI analyzes content and assigns one category below. No manual setup needed.
                            </p>
                        </div>
                    </div>

                    {/* Category list */}
                    <div className="bg-white border border-[#E7E5E4] rounded-[2px] overflow-hidden">
                        {categories.map((cat, i) => (
                            <div
                                key={cat.name}
                                className={`flex items-center justify-between px-5 py-4 ${i < categories.length - 1 ? "border-b border-[#E7E5E4]" : ""}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium rounded-[2px] ${cat.bg} ${cat.text}`}>
                                        {cat.name}
                                    </span>
                                    <span className="text-[13px] text-[#78716C]">{cat.description}</span>
                                </div>
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-[#059669] shrink-0" />
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
