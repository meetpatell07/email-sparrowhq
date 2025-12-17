"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import { Mail } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await signIn.social({
                provider: "google",
                callbackURL: "/dashboard"
            });
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black font-sans antialiased select-none">
            <div className="w-full max-w-sm p-4 sm:p-0">
                <div className="space-y-12">
                    {/* Brand/Logo Section */}
                    <div className="flex flex-col items-left space-y-4">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-sm">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                AI Email Assistant
                            </h1>
                            <p className="text-sm text-gray-500">
                                Connect your account to get started.
                            </p>
                        </div>
                    </div>

                    {/* Action Section */}
                    <div className="space-y-4">
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-black px-6 py-3 rounded-xl font-medium text-black hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {!loading && (
                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}

                            <span>
                                {loading ? "Connecting..." : "Continue with Google"}
                            </span>
                        </button>

                        <div className="text-center text-[11px] text-gray-400">
                            By continuing, you agree to our Terms & Privacy.
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle Minimal Footer */}
            <div className="absolute bottom-12 flex gap-8 text-[11px] text-gray-400 font-medium">
                <a href="#" className="hover:text-black transition-colors">Privacy</a>
                <a href="#" className="hover:text-black transition-colors">Security</a>
                <a href="#" className="hover:text-black transition-colors">Support</a>
            </div>
        </div>
    );
}
