import { Sidebar } from "@/components/Sidebar";

export default function EmailsPage() {
    return (
        <div className="flex h-screen bg-white font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 flex items-center justify-between px-8 border-b border-gray-100 flex-shrink-0">
                    <h1 className="text-xl font-semibold text-black">Emails</h1>
                </header>
                <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                    <div className="max-w-5xl mx-auto">
                        <p className="text-gray-500">Your synced emails will appear here.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
