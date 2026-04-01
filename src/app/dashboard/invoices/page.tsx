"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { HugeiconsIcon } from "@hugeicons/react";
import { Invoice01Icon } from "@hugeicons/core-free-icons";

export default function InvoicesPage() {
    return (
        <DashboardLayout>
            

            <div className="min-h-full pb-20">
                <div className="p-6 max-w-5xl mx-auto">
                    <div className="mb-4">
                        <h1 className="text-[22px] font-semibold text-[#1C1917]">Invoices</h1>
                        <p className="text-[13px] text-[#78716C] mt-1">Extracted from your emails automatically</p>
                    </div>

                    <div className="bg-white border border-[#E7E5E4] rounded-[2px] py-20 flex flex-col items-center gap-3">
                        <HugeiconsIcon icon={Invoice01Icon} size={28} className="text-[#E7E5E4]" />
                        <p className="text-[14px] font-medium text-[#1C1917]">No invoices yet</p>
                        <p className="text-[13px] text-[#78716C]">Invoice data will appear here once emails are synced.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
