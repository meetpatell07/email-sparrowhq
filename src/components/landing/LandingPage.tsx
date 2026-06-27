"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { beginGoogleSignIn, type GoogleSignInAttempt } from "@/lib/google-oauth";
import { InAppBrowserNotice } from "@/components/InAppBrowserNotice";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11 } },
};

const navigation = [
  { label: "Product", href: "#features" },
  { label: "FAQ", href: "#faq" },
];

const features = [
  {
    num: "01",
    title: "Triage on arrival",
    body: "Every email is labeled by urgency, intent, and category the moment it lands — inbox becomes an action board.",
  },
  {
    num: "02",
    title: "Drafts with context",
    body: "Replies are written with your calendar, thread history, and linked documents already factored in.",
  },
  {
    num: "03",
    title: "One workspace",
    body: "Gmail, Calendar, and Drive stay in sync so nothing slips between tools.",
  },
];

const faqs = [
  {
    q: "Does EmailHQ send emails automatically?",
    a: "No. It prepares drafts and labels threads. You review before anything goes out.",
  },
  {
    q: "Is it only for Gmail?",
    a: "Gmail is live today. Outlook support is on the roadmap.",
  },
  {
    q: "Can it use context outside the inbox?",
    a: "Yes — Google Calendar, attachments, and Drive documents are all fair game for drafting.",
  },
];

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/emailhq.svg"
      alt="EmailHQ"
      width={size}
      height={size}
      priority
    />
  );
}

export function LandingPage() {
  const [connecting, setConnecting] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [googleAttempt, setGoogleAttempt] = useState<GoogleSignInAttempt | null>(null);
  const router = useRouter();
  const year = useMemo(() => new Date().getFullYear(), []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const attempt = await beginGoogleSignIn("/dashboard");
      setGoogleAttempt(attempt);
      if (!attempt.ok) setConnecting(false);
    } catch {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] antialiased selection:bg-black/10">
      {!googleAttempt?.ok && googleAttempt?.reason === "in_app_browser" && (
        <div className="fixed inset-x-4 top-24 z-[60] mx-auto w-full max-w-2xl">
          <InAppBrowserNotice
            browser={googleAttempt.browser}
            externalUrl={googleAttempt.externalUrl}
            androidIntentUrl={googleAttempt.androidIntentUrl}
            className="rounded-2xl p-5 shadow-xl"
          />
        </div>
      )}

      {/* Sticky pill navbar */}
      <header className="sticky top-0 z-50 px-4 pt-4 md:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-black/[0.09] bg-white/80 px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={32} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-[#666] transition-colors hover:text-[#0a0a0a]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => router.push("/outlook-coming-soon")}
              className="rounded-full border border-black/12 px-4 py-2 text-sm text-[#555] transition-colors hover:border-black/25 hover:text-black"
            >
              Outlook soon
            </button>
            <button
              type="button"
              onClick={handleConnect}
              disabled={connecting}
              className="rounded-full bg-[#0a0a0a] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-75 disabled:opacity-40"
            >
              {connecting ? "Connecting…" : "Connect Gmail"}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 md:hidden"
            aria-label="Toggle menu"
          >
            <span className="flex flex-col gap-[5px]">
              <span
                className={`block h-[1.5px] w-4 bg-current transition-all duration-300 ${mobileOpen ? "translate-y-[6.5px] rotate-45" : ""}`}
              />
              <span
                className={`block h-[1.5px] w-4 bg-current transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-[1.5px] w-4 bg-current transition-all duration-300 ${mobileOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-2 max-w-5xl rounded-3xl border border-black/[0.09] bg-white/90 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-3">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-[#0a0a0a]"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleConnect}
                disabled={connecting}
                className="w-full rounded-full bg-[#0a0a0a] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {connecting ? "Connecting…" : "Connect Gmail"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/outlook-coming-soon")}
                className="w-full rounded-full border border-black/12 px-5 py-3 text-sm text-[#555]"
              >
                Join Outlook waitlist
              </button>
            </div>
          </motion.div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="px-6 py-28 md:py-40">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="flex flex-col items-start gap-7"
            >
              <motion.h1
                variants={fadeUp}
                className="font-heading text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-[0.97] tracking-[-0.055em]"
              >
                Your inbox,<br />finally in order.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="max-w-[40ch] text-[1.1rem] leading-8 text-[#555]"
              >
                EmailHQ triages every message, drafts context-aware replies, and keeps
                scheduling, documents, and follow-ups moving — from one place.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={connecting}
                  className="rounded-full bg-[#0a0a0a] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-75 disabled:opacity-40"
                >
                  {connecting ? "Connecting…" : "Start with Gmail →"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/outlook-coming-soon")}
                  className="rounded-full border border-black/15 px-6 py-3 text-sm font-medium text-[#555] transition-colors hover:border-black/30 hover:text-black"
                >
                  Outlook soon
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-black/[0.07] px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-px bg-black/[0.06] sm:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white px-8 py-9"
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#bbb]">
                    {f.num}
                  </p>
                  <h3 className="mt-4 text-[1.1rem] font-semibold tracking-[-0.03em]">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#666]">{f.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-black/[0.07] px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#bbb]">FAQ</p>
            <div className="mt-8 divide-y divide-black/[0.07]">
              {faqs.map((faq, i) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="py-6"
                >
                  <h3 className="text-[0.95rem] font-semibold">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#666]">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-black/[0.07] px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="font-heading text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
                  Ready to clear the backlog?
                </h2>
                <p className="mt-1.5 text-sm text-[#888]">Connect Gmail in under a minute.</p>
              </div>
              <button
                type="button"
                onClick={handleConnect}
                disabled={connecting}
                className="shrink-0 rounded-full bg-[#0a0a0a] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-75 disabled:opacity-40"
              >
                {connecting ? "Connecting…" : "Get started →"}
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.07] px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-[#aaa]">
          <div className="flex items-center gap-2">
            <LogoMark size={16} />
            <span>EmailHQ</span>
          </div>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-black">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-black">Terms</Link>
          </div>
          <span>© {year}</span>
        </div>
      </footer>
    </div>
  );
}
