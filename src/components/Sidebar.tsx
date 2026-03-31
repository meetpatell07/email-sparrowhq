"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Home01Icon,
    Mail01Icon,
    Calendar01Icon,
    Tag01Icon,
    Invoice01Icon,
    CheckmarkSquare01Icon,
    Settings01Icon,
    ArrowUpDownIcon,
    UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const mainNav = [
    { name: "Dashboard", icon: Home01Icon, href: "/dashboard" },
    { name: "Emails", icon: Mail01Icon, href: "/dashboard/emails" },
    { name: "Calendar", icon: Calendar01Icon, href: "/dashboard/calendar" },
    { name: "Categories", icon: Tag01Icon, href: "/dashboard/categories" },
    { name: "Invoices", icon: Invoice01Icon, href: "/dashboard/invoices" },
    { name: "Drafts", icon: CheckmarkSquare01Icon, href: "/dashboard/drafts" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = authClient.useSession();
    const user = session?.user;

    const initial = (user?.name || "S").charAt(0).toUpperCase();

    return (
        <aside className="w-[240px] h-screen flex flex-col bg-white border-r border-[#E7E5E4] shrink-0">

            {/* Brand */}
            <div className="px-4 pt-4 pb-2">
                <button className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#F5F5F4] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#E7E5E4] flex items-center justify-center text-[13px] font-semibold text-[#1C1917] shrink-0">
                        {initial}
                    </div>
                    <span className="flex-1 text-left text-[14px] font-semibold text-[#1C1917] truncate">
                        SparrowHQ
                    </span>
                    <HugeiconsIcon icon={ArrowUpDownIcon} size={16} className="text-[#A8A29E] shrink-0" />
                </button>
            </div>

            {/* Main nav */}
            <nav className="flex-1 px-4 py-2 overflow-y-auto no-scrollbar">
                <div className="space-y-0.5">
                    {mainNav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-2 py-2 rounded-md text-[14px] transition-colors",
                                    isActive
                                        ? "bg-[#F5F5F4] text-[#1C1917] font-medium"
                                        : "text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#1C1917] font-normal"
                                )}
                            >
                                <HugeiconsIcon
                                    icon={item.icon}
                                    size={18}
                                    className={cn(
                                        "shrink-0",
                                        isActive ? "text-[#1C1917]" : "text-[#A8A29E]"
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom: Settings + User */}
            <div className="px-4 pb-4 space-y-0.5">
                <Link
                    href="/dashboard/settings"
                    className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-md text-[14px] transition-colors",
                        pathname === "/dashboard/settings"
                            ? "bg-[#F5F5F4] text-[#1C1917] font-medium"
                            : "text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#1C1917] font-normal"
                    )}
                >
                    <HugeiconsIcon icon={Settings01Icon} size={18} className="text-[#A8A29E] shrink-0" />
                    Settings
                </Link>

                <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-2 py-2 rounded-md text-[14px] text-[#1C1917] font-medium hover:bg-[#F5F5F4] transition-colors"
                >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-[#E7E5E4] shrink-0">
                        {user?.image ? (
                            <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <HugeiconsIcon icon={UserCircleIcon} size={18} className="text-[#78716C]" />
                            </div>
                        )}
                    </div>
                    <span className="truncate">{user?.name || "Profile"}</span>
                </Link>
            </div>
        </aside>
    );
}
