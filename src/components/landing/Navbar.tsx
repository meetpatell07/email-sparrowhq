"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu01Icon, Sun01Icon, Moon01Icon } from "@hugeicons/core-free-icons";
import { SparrowMark } from "./Logo";
import { beginGoogleSignIn, type GoogleSignInAttempt } from "@/lib/google-oauth";
import { InAppBrowserNotice } from "@/components/InAppBrowserNotice";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const saved = window.localStorage.getItem("lp-theme");
    return saved ? saved === "dark" : true;
  });
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [googleAttempt, setGoogleAttempt] = useState<GoogleSignInAttempt | null>(null);
  const router = useRouter();

  const handleConnectGoogle = async () => {
    setConnectingGoogle(true);
    try {
      const attempt = await beginGoogleSignIn("/dashboard");
      setGoogleAttempt(attempt);

      if (!attempt.ok) {
        setConnectingGoogle(false);
      }
    } catch {
      setConnectingGoogle(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("lp-theme", next ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex items-start justify-center pt-3 px-4 md:px-6 pointer-events-none">
        {/* Floating pill card */}
        <div
          className="pointer-events-auto w-full max-w-screen-xl flex items-center justify-between h-14 px-4 md:px-5 rounded-2xl border shadow-sm"
          style={{
            background: "var(--lp-surface)",
            borderColor: "var(--lp-border)",
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <SparrowMark size={26} color="var(--lp-text-primary)" />
            <span
              className="font-heading font-bold text-[16px]"
              style={{ color: "var(--lp-text-primary)" }}
            >
              EmailHQ
            </span>
          </Link>

          {/* Desktop nav links — center */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[14px] font-body px-3.5 py-1.5 rounded-lg transition-colors hover:opacity-100"
                style={{ color: "var(--lp-text-secondary)" }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-opacity hover:opacity-70"
              style={{ color: "var(--lp-text-muted)" }}
              aria-label="Toggle theme"
            >
              <HugeiconsIcon icon={isDark ? Sun01Icon : Moon01Icon} size={17} />
            </button>

            <button
              onClick={handleConnectGoogle}
              disabled={connectingGoogle}
              className="hidden md:inline-flex items-center gap-2 text-[13px] font-body font-semibold px-3.5 py-1.5 rounded-lg border transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: "var(--lp-text-primary)",
                borderColor: "var(--lp-border)",
                background: "var(--lp-surface-raised)",
              }}
            >
              <svg className="w-[14px] h-[14px] shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {connectingGoogle ? "Connecting…" : "Connect to Gmail"}
            </button>

            <button
              onClick={() => router.push("/outlook-coming-soon")}
              className="hidden md:inline-flex items-center gap-2 text-[13px] font-body font-semibold px-3.5 py-1.5 rounded-lg transition-opacity hover:opacity-80"
              style={{
                background: "#0078d4",
                color: "#ffffff",
              }}
            >
              <svg className="w-[14px] h-[14px] shrink-0" viewBox="0 0 23 23" fill="none">
                <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
              </svg>
              Connect to Outlook
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ color: "var(--lp-text-primary)" }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <HugeiconsIcon icon={Menu01Icon} size={20} />
            </button>
          </div>
        </div>
      </header>

      {!googleAttempt?.ok && googleAttempt?.reason === "in_app_browser" && (
        <div className="fixed inset-x-4 top-20 z-[55] mx-auto w-full max-w-screen-md pointer-events-none">
          <InAppBrowserNotice
            browser={googleAttempt.browser}
            externalUrl={googleAttempt.externalUrl}
            androidIntentUrl={googleAttempt.androidIntentUrl}
            className="pointer-events-auto rounded-2xl p-4 shadow-lg"
          />
        </div>
      )}

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col p-6"
            style={{ background: "var(--lp-bg-primary)" }}
          >
            <div className="flex items-center justify-between mb-10">
              <span
                className="font-heading font-bold text-[17px]"
                style={{ color: "var(--lp-text-primary)" }}
              >
                EmailHQ
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ color: "var(--lp-text-muted)" }}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-heading font-semibold text-[24px]"
                  style={{ color: "var(--lp-text-primary)" }}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <button
                onClick={() => { setMobileOpen(false); handleConnectGoogle(); }}
                disabled={connectingGoogle}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border font-body font-medium text-[15px] disabled:opacity-50"
                style={{
                  borderColor: "var(--lp-border)",
                  color: "var(--lp-text-primary)",
                  background: "var(--lp-surface-raised)",
                }}
              >
                <svg className="w-[16px] h-[16px] shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {connectingGoogle ? "Connecting…" : "Connect to Gmail"}
              </button>
              <button
                onClick={() => { setMobileOpen(false); router.push("/outlook-coming-soon"); }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-body font-medium text-[15px]"
                style={{
                  background: "#0078d4",
                  color: "#ffffff",
                }}
              >
                <svg className="w-[16px] h-[16px] shrink-0" viewBox="0 0 23 23" fill="none">
                  <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                  <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                  <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                  <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
                </svg>
                Connect to Outlook
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
