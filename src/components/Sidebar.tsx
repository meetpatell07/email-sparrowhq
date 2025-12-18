"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Mail,
    FileText,
    CheckSquare,
    Settings,
    LifeBuoy,
    ChevronRight,
    Search,
    Tag,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Calendar", icon: Calendar, href: "/dashboard/calendar" },
    { name: "Categorization", icon: Tag, href: "/dashboard/categories" },
    { name: "Emails", icon: Mail, href: "/dashboard/emails" },
    { name: "Invoices", icon: FileText, href: "/dashboard/invoices" },
    { name: "Drafts", icon: CheckSquare, href: "/dashboard/drafts" },
];

const otherItems = [
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
    { name: "Support", icon: LifeBuoy, href: "/dashboard/support" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = authClient.useSession();
    const user = session?.user;

    return (
        <aside className="w-72 h-screen flex flex-col bg-white border-r border-gray-100 font-sans">
            {/* Logo/Brand */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">SparrowHQ</span>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-black transition-all outline-none"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 overflow-y-auto">
                <div className="mb-8">
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Main</p>
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                        isActive
                                            ? "bg-gray-50 text-black shadow-sm"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-black"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn(
                                            "w-5 h-5 transition-colors",
                                            isActive ? "text-black" : "text-gray-400 group-hover:text-black"
                                        )} />
                                        <span>{item.name}</span>
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4" />}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Others</p>
                    <div className="space-y-1">
                        {otherItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all duration-200 text-sm font-medium group"
                            >
                                <item.icon className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* User Profile Section */}
            <div className="p-4 mt-auto border-t border-gray-50">
                <Link
                    href="/dashboard/profile"
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-all duration-200 group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm">
                            {user?.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black text-white text-xs font-bold">
                                    {(user?.name || "U").charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 flex items-center gap-1 leading-none mb-1">
                                {user?.name || "User Name"}
                                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth="4">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                </div>
                            </span>
                            <span className="text-[10px] text-gray-400 truncate w-32 font-medium">
                                {user?.email || "user@example.com"}
                            </span>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
                </Link>
            </div>
        </aside>
    );
}
