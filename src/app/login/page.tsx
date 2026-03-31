"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import { SparrowMark } from "@/components/landing/Logo";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await signIn.social({
                provider: "google",
                callbackURL: "/dashboard",
            });
        } catch (error) {
            console.error("Login failed:", error);
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen" style={{ background: "#0a0a0a" }}>
            {/* Left panel — decorative quote */}
            <div
                className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
                style={{ background: "#111111", borderRight: "1px solid #1e1e1e" }}
            >
                <div className="flex items-center gap-2.5">
                    <SparrowMark size={28} color="#f0efe9" />
                    <span
                        className="font-heading font-bold text-[17px]"
                        style={{ color: "#f0efe9" }}
                    >
                        SparrowHQ
                    </span>
                </div>

                <div>
                    <p
                        className="font-body text-[11px] uppercase tracking-widest mb-6"
                        style={{ color: "#333333" }}
                    >
                        What our users say
                    </p>
                    <blockquote
                        className="font-heading text-[2rem] leading-[1.2] font-medium"
                        style={{ color: "#f0efe9" }}
                    >
                        &ldquo;I used to spend 45 minutes every morning triaging my inbox. Now I open SparrowHQ, review the AI&rsquo;s draft replies, and I&rsquo;m done in 10.&rdquo;
                    </blockquote>
                    <p
                        className="mt-6 font-body text-[13px]"
                        style={{ color: "#4a4a4a" }}
                    >
                        Sarah K. — Founder, Meridian Studio
                    </p>
                </div>

                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: i === 0 ? "#f0efe9" : "#2a2a2a" }}
                        />
                    ))}
                </div>
            </div>

            {/* Right panel — auth form */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
                {/* Mobile logo */}
                <div className="flex lg:hidden items-center gap-2 mb-14">
                    <SparrowMark size={26} color="#f0efe9" />
                    <span
                        className="font-heading font-bold text-[16px]"
                        style={{ color: "#f0efe9" }}
                    >
                        SparrowHQ
                    </span>
                </div>

                <div className="w-full max-w-[360px]">
                    <h1
                        className="font-heading font-medium text-[2.25rem] leading-tight mb-2"
                        style={{ color: "#f0efe9" }}
                    >
                        Welcome back
                    </h1>
                    <p
                        className="font-body text-[14px] mb-10"
                        style={{ color: "#4a4a4a" }}
                    >
                        Connect your Gmail to get started with SparrowHQ.
                    </p>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg font-body font-medium text-[14px] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: "#f0efe9", color: "#0a0a0a" }}
                    >
                        {!loading && (
                            <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        )}
                        <span>{loading ? "Connecting…" : "Continue with Google"}</span>
                    </button>

                    <div
                        className="flex items-center gap-3 my-6"
                        style={{ color: "#262626" }}
                    >
                        <div className="flex-1 h-px" style={{ background: "#1e1e1e" }} />
                        <span className="font-body text-[11px]" style={{ color: "#333333" }}>
                            secured by OAuth 2.0
                        </span>
                        <div className="flex-1 h-px" style={{ background: "#1e1e1e" }} />
                    </div>

                    <p
                        className="text-center font-body text-[12px]"
                        style={{ color: "#333333" }}
                    >
                        By continuing, you agree to our{" "}
                        <a
                            href="#"
                            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                            style={{ color: "#4a4a4a" }}
                        >
                            Terms
                        </a>{" "}
                        &amp;{" "}
                        <a
                            href="#"
                            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                            style={{ color: "#4a4a4a" }}
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>

                <div className="mt-auto pt-12 flex gap-8 font-body text-[12px]" style={{ color: "#333333" }}>
                    <a href="#" className="hover:opacity-70 transition-opacity">Privacy</a>
                    <a href="#" className="hover:opacity-70 transition-opacity">Security</a>
                    <a href="#" className="hover:opacity-70 transition-opacity">Support</a>
                </div>
            </div>
        </div>
    );
}
