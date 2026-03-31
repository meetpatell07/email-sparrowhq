"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun01Icon, Moon01Icon, Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { SparrowMark } from "./Logo";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#stats" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [isDark, setIsDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lp-theme");
    const dark = saved ? saved === "dark" : true;
    setIsDark(dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("lp-theme", next ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 h-16 flex items-center transition-all duration-300",
          scrolled
            ? "backdrop-blur-md border-b"
            : "border-b border-transparent"
        )}
        style={{
          background: scrolled ? "color-mix(in srgb, var(--lp-bg-primary) 85%, transparent)" : "transparent",
          borderColor: scrolled ? "var(--lp-border)" : "transparent",
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 w-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" style={{ color: "var(--lp-text-primary)" }}>
            <SparrowMark size={28} />
            <span className="font-heading font-bold text-[17px]" style={{ color: "var(--lp-text-primary)" }}>EmailHQ</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[14px] font-body transition-colors hover:opacity-100"
                style={{ color: "var(--lp-text-secondary)" }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:opacity-80"
              style={{ color: "var(--lp-text-muted)" }}
              aria-label="Toggle theme"
            >
              <HugeiconsIcon icon={isDark ? Sun01Icon : Moon01Icon} size={17} />
            </button>

            <Link
              href="/login"
              className="hidden md:inline-flex items-center text-[14px] font-body font-medium px-4 py-1.5 rounded-full border transition-colors hover:opacity-80"
              style={{ color: "var(--lp-text-secondary)", borderColor: "var(--lp-border)" }}
            >
              Sign in
            </Link>

            <motion.a
              href="/login"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="hidden md:inline-flex items-center gap-1.5 text-[14px] font-body font-medium px-4 py-1.5 rounded-full transition-colors"
              style={{ background: "var(--lp-accent)", color: "var(--lp-accent-fg)" }}
            >
              Get started free
            </motion.a>

            <button
              className="md:hidden w-8 h-8 flex items-center justify-center"
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
              <span className="font-heading font-bold text-[17px] ml-1" style={{ color: "var(--lp-text-primary)" }}>SparrowHQ</span>
              <button onClick={() => setMobileOpen(false)} style={{ color: "var(--lp-text-muted)" }}>
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
              <a href="/login" className="text-center py-3 rounded-full border font-body font-medium text-[15px]"
                style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-primary)" }}>
                Sign in
              </a>
              <a href="/login" className="text-center py-3 rounded-full font-body font-medium text-[15px]"
                style={{ background: "var(--lp-accent)", color: "var(--lp-accent-fg)" }}>
                Get started free
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
