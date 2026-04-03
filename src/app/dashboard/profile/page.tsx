"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { authClient } from "@/lib/auth-client";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserCircleIcon, Settings01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function ProfilePage() {
    const { data: session } = authClient.useSession();
    const user = session?.user;

    return (
        <DashboardLayout>
            <div className="min-h-full pb-20">
                <div className="p-4 md:p-6 max-w-xl mx-auto space-y-4">

                    {/* Avatar + name */}
                    <div className="bg-white border border-[#E7E5E4] rounded-lg px-5 py-6 flex flex-col items-center gap-3 text-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F5F5F4] border border-[#E7E5E4]">
                            {user?.image ? (
                                <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <HugeiconsIcon icon={UserCircleIcon} size={32} className="text-[#78716C]" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-[17px] font-semibold text-[#1C1917]">{user?.name || "—"}</p>
                            <p className="text-[13px] text-[#78716C] mt-0.5">{user?.email || "—"}</p>
                        </div>
                    </div>

                    {/* Quick link to full settings */}
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center justify-between gap-4 bg-white border border-[#E7E5E4] rounded-lg px-5 py-4 hover:bg-[#FAFAF9] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-[6px] bg-[#F5F5F4] flex items-center justify-center">
                                <HugeiconsIcon icon={Settings01Icon} size={17} className="text-[#57534E]" />
                            </div>
                            <div>
                                <p className="text-[14px] font-medium text-[#1C1917]">Settings & connections</p>
                                <p className="text-[12px] text-[#78716C] mt-0.5">Manage your Google account and session</p>
                            </div>
                        </div>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-[#A8A29E] shrink-0" />
                    </Link>

                </div>
            </div>
        </DashboardLayout>
    );
}
