
"use client";

import { syncEmails } from "@/app/actions";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function SyncButton() {
    const [loading, setLoading] = useState(false);

    const handleSync = async () => {
        setLoading(true);
        try {
            await syncEmails();
            alert("Sync complete!");
        } catch (e) {
            alert("Sync failed");
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleSync}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Syncing..." : "Sync Emails"}
        </button>
    );
}
