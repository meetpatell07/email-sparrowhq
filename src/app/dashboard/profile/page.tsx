"use client";

import { Sidebar } from "@/components/Sidebar";
import { authClient } from "@/lib/auth-client";
import { SignOutButton } from "@/components/SignOutButton";

export default function ProfilePage() {
    const { data: session } = authClient.useSession();
    const user = session?.user;

    return (
        <div className="flex h-screen bg-white font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 flex items-center justify-between px-8 border-b border-gray-100 flex-shrink-0">
                    <h1 className="text-xl font-semibold text-black">Profile</h1>
                </header>
                <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                    <div className="max-w-xl mx-auto">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200 shadow-sm flex-shrink-0">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-black text-white text-2xl font-bold">
                                        {(user?.name || "U").charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-black">{user?.name || "User Name"}</h2>
                                <p className="text-gray-500">{user?.email || "user@example.com"}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Account Actions</h3>
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
