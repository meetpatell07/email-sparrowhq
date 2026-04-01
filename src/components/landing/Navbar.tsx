"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu01Icon, Sun01Icon, Moon01Icon } from "@hugeicons/core-free-icons";
import { SparrowMark } from "./Logo";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("lp-theme");
    const dark = saved ? saved === "dark" : true;
    setIsDark(dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, []);

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

            <Link
              href="/login"
              className="hidden md:inline-flex items-center text-[14px] font-body font-medium px-4 py-1.5 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: "var(--lp-text-secondary)" }}
            >
              Log in
            </Link>

            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-1.5 text-[14px] font-body font-semibold px-4 py-1.5 rounded-lg border transition-opacity hover:opacity-80"
              style={{
                color: "var(--lp-text-primary)",
                borderColor: "var(--lp-border)",
                background: "var(--lp-surface-raised)",
              }}
            >
              Get started free
            </Link>

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
              <a
                href="/login"
                className="text-center py-3 rounded-xl border font-body font-medium text-[15px]"
                style={{
                  borderColor: "var(--lp-border)",
                  color: "var(--lp-text-primary)",
                }}
              >
                Log in
              </a>
              <a
                href="/login"
                className="text-center py-3 rounded-xl font-body font-medium text-[15px]"
                style={{
                  background: "var(--lp-accent)",
                  color: "var(--lp-accent-fg)",
                }}
              >
                Get started free
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
