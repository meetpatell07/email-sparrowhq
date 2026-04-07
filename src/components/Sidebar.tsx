"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Home01Icon,
    Tag01Icon,
    Archive01Icon,
    CheckmarkSquare01Icon,
    Settings01Icon,
    ArrowUpDownIcon,
    UserCircleIcon,
    GoogleDriveIcon,
    Cancel01Icon,
    ListViewIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { SparrowMark } from "@/components/landing/Logo";

const mainNav = [
    { name: "Overview",    icon: Home01Icon,           href: "/dashboard" },
    { name: "Categories",  icon: Tag01Icon,             href: "/dashboard/categories" },
    { name: "Vault",       icon: Archive01Icon,         href: "/dashboard/vault" },
    { name: "Drafts",      icon: CheckmarkSquare01Icon, href: "/dashboard/drafts" },
    { name: "Drive",       icon: GoogleDriveIcon,       href: "/dashboard/drive" },
    { name: "Trust Log",   icon: ListViewIcon,          href: "/dashboard/audit" },
];

interface SidebarProps {
    onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = authClient.useSession();
    const user = session?.user;

    return (
        <aside className="w-[240px] h-screen flex flex-col bg-white border-r border-[#E7E5E4] shrink-0">
            {/* Brand / Workspace */}
            <div className="px-3 pt-4 pb-4 flex items-center justify-between">
                <button className="flex-1 flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#F5F5F4] transition-colors min-w-0">
                    <div className="w-7 h-7 flex items-center justify-center shrink-0">
                        <SparrowMark size={28} />
                    </div>
                    <span className="flex-1 text-left text-[20px] font-heading font-semibold text-[#1C1917] tracking-tight truncate">
                        EmailHQ
                    </span>
                    <HugeiconsIcon icon={ArrowUpDownIcon} size={14} className="text-[#A8A29E] shrink-0" />
                </button>
                {/* Close button visible only in mobile drawer mode */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-1 w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F5F5F4] transition-colors shrink-0"
                        aria-label="Close menu"
                    >
                        <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-[#78716C]" />
                    </button>
                )}
            </div>

            {/* Main nav */}
            <nav className="flex-1 px-3 overflow-y-auto no-scrollbar pb-4">
                <div className="space-y-0.5">
                    {mainNav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-[14px] transition-colors",
                                    isActive
                                        ? "bg-[#F5F5F4] text-[#1C1917] font-medium"
                                        : "text-[#57534E] hover:bg-[#F5F5F4] hover:text-[#1C1917] font-normal"
                                )}
                            >
                                <HugeiconsIcon
                                    icon={item.icon}
                                    size={18}
                                    className={isActive ? "text-[#1C1917]" : "text-[#78716C]"}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom: Settings + User */}
            <div className="px-3 pb-4 space-y-0.5">
                <Link
                    href="/dashboard/settings"
                    onClick={onClose}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-[14px] transition-colors",
                        pathname === "/dashboard/settings"
                            ? "bg-[#F5F5F4] text-[#1C1917] font-medium"
                            : "text-[#57534E] hover:bg-[#F5F5F4] hover:text-[#1C1917] font-normal"
                    )}
                >
                    <HugeiconsIcon icon={Settings01Icon} size={18} className="text-[#78716C] shrink-0" />
                    Settings
                </Link>

                <Link
                    href="/dashboard/profile"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 mt-2 rounded-md text-[14px] text-[#1C1917] font-medium hover:bg-[#F5F5F4] transition-colors"
                >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-[#E7E5E4] shrink-0 border border-gray-200">
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
