import type { Metadata } from "next";
import Link from "next/link";
import { SparrowMark } from "@/components/landing/Logo";

export const metadata: Metadata = {
    title: "Outlook Coming Soon — EmailHQ",
    description: "Outlook integration is under development. Use Gmail in the meantime.",
};

export default function OutlookComingSoonPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6" style={{ background: "#0a0a0a" }}>
            <div className="flex flex-col items-center text-center max-w-[420px]">
                {/* Logo */}
                <div
                    className="mb-8 p-4 rounded-2xl border"
                    style={{ background: "#111111", borderColor: "#1e1e1e" }}
                >
                    <SparrowMark size={40} color="#f0efe9" />
                </div>

                {/* Microsoft logo */}
                <div className="mb-6">
                    <svg width="32" height="32" viewBox="0 0 23 23" fill="none">
                        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                        <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                        <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                        <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
                    </svg>
                </div>

                <h1
                    className="font-heading font-medium text-[2rem] leading-tight mb-3"
                    style={{ color: "#f0efe9" }}
                >
                    Outlook is coming soon
                </h1>

                <p
                    className="font-body text-[14px] leading-relaxed mb-8"
                    style={{ color: "#4a4a4a" }}
                >
                    We&apos;re actively building Outlook and Microsoft 365 support. In the meantime, connect your Gmail account to get started.
                </p>

                <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg font-body font-medium text-[14px] transition-opacity hover:opacity-90 mb-3"
                    style={{ background: "#f0efe9", color: "#0a0a0a" }}
                >
                    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Connect Gmail instead
                </Link>

                <Link
                    href="/"
                    className="font-body text-[13px] transition-opacity hover:opacity-70"
                    style={{ color: "#333333" }}
                >
                    ← Back to home
                </Link>
            </div>
        </div>
    );
}
