
"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        await signIn.social({
            provider: "google",
            callbackURL: "/dashboard"
        });
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    {loading ? "Connecting..." : "Sign in with Google"}
                </button>
            </div>
        </div>
    );
}
