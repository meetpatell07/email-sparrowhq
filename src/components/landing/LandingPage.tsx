"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  CustomerSupportIcon,
  DashboardBrowsingIcon,
  File01Icon,
  GoogleDriveIcon,
  Invoice01Icon,
  Mail02Icon,
  Mail01Icon,
  Menu01Icon,
  Moon02Icon,
  Search01Icon,
  Shield01Icon,
  SparklesIcon,
  Sun01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { SparrowMark } from "./Logo";
import { beginGoogleSignIn, type GoogleSignInAttempt } from "@/lib/google-oauth";
import { InAppBrowserNotice } from "@/components/InAppBrowserNotice";

const navigation = [
  { label: "Platform", href: "#platform" },
  { label: "Workflow", href: "#workflow" },
  { label: "Proof", href: "#proof" },
  { label: "FAQ", href: "#faq" },
];

const metrics = [
  { value: "< 90s", label: "from new email to draft-ready reply" },
  { value: "6 lanes", label: "finance, scheduling, support, personal and more" },
  { value: "1 workspace", label: "Gmail, Calendar, Vault and Drive in sync" },
];

const capabilities = [
  {
    icon: SparklesIcon,
    title: "Triage that feels like a chief of staff",
    body: "Sparrow labels urgency, intent, and category the second an email arrives, so the inbox turns into an action board instead of a holding pen.",
  },
  {
    icon: Mail01Icon,
    title: "Drafts with context, not canned copy",
    body: "Replies are written with calendar context, thread history, and sender intent already factored in, then saved as drafts for review.",
  },
  {
    icon: Invoice01Icon,
    title: "Operational details pulled automatically",
    body: "Invoices, amounts, vendors, due dates, and attachments are extracted into something the team can actually act on.",
  },
  {
    icon: Calendar03Icon,
    title: "Scheduling without the back-and-forth",
    body: "Available slots are suggested from your real calendar, so meeting emails stop sounding optimistic and start being accurate.",
  },
];

const workflow = [
  {
    title: "Signal capture",
    eyebrow: "01",
    body: "Emails are classified the moment they land. Important threads surface instantly while low-value noise gets pushed out of the way.",
  },
  {
    title: "Context assembly",
    eyebrow: "02",
    body: "Thread history, calendar availability, attachments, and linked documents are combined before the assistant decides what to draft.",
  },
  {
    title: "Decision-ready output",
    eyebrow: "03",
    body: "You get a clean draft, a recommended action, and the supporting context in one view instead of hunting across tools.",
  },
];

const proofCards = [
  {
    title: "Chrome extension",
    subtitle: "Draft from any page",
    body: "Turn a job listing, vendor page, or customer profile into an email draft without switching tabs.",
    icon: DashboardBrowsingIcon,
    accent: "from-[#f97316]/25 via-[#fb923c]/10 to-transparent",
  },
  {
    title: "Google Drive",
    subtitle: "Use docs as source material",
    body: "Reference proposals, notes, and specs directly so the email matches the actual document instead of your memory of it.",
    icon: GoogleDriveIcon,
    accent: "from-[#14b8a6]/25 via-[#2dd4bf]/10 to-transparent",
  },
  {
    title: "Shared accountability",
    subtitle: "Safer than a send-first AI",
    body: "Every action is reviewable. Sparrow drafts and organizes, but your team keeps the final call.",
    icon: Shield01Icon,
    accent: "from-[#a855f7]/25 via-[#c084fc]/10 to-transparent",
  },
];

const testimonials = [
  {
    quote:
      "It feels less like another inbox app and more like having an ops-minded executive assistant sitting inside Gmail.",
    name: "Maya R.",
    role: "Founder, client services studio",
  },
  {
    quote:
      "Our scheduling and invoice threads stopped slipping because the suggested reply already included the right context and next move.",
    name: "Jordan T.",
    role: "Operations lead, consulting team",
  },
];

const faqs = [
  {
    question: "Does Sparrow send emails automatically?",
    answer:
      "No. Sparrow prepares drafts, labels threads, and suggests next actions. Your team reviews before anything goes out.",
  },
  {
    question: "Is it only for Gmail?",
    answer:
      "Gmail is live today. Outlook support is already positioned in the product flow and can be joined from the waitlist path.",
  },
  {
    question: "Can it use context outside the inbox?",
    answer:
      "Yes. Sparrow can reference Google Calendar, attachments, and Drive documents so drafts reflect what is actually true, not just what was in the thread.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const beforeRows = [
  { sender: "Unread sender", subject: "Untitled thread preview", tag: "Inbox", time: "09:12" },
  { sender: "Unknown contact", subject: "Follow-up requested in thread", tag: "New", time: "08:47" },
  { sender: "Ops queue", subject: "Document shared for approval", tag: "Docs", time: "08:02" },
  { sender: "Billing team", subject: "Invoice needs review today", tag: "Finance", time: "07:31" },
];

const afterRows = [
  { sender: "Priority lane", subject: "Meeting response drafted with calendar context", tag: "Draft ready", time: "2 actions" },
  { sender: "Finance lane", subject: "Invoice extracted and filed into vault", tag: "Processed", time: "Vendor tagged" },
  { sender: "Follow-up lane", subject: "Waiting on reply, reminder scheduled", tag: "Tracked", time: "Tomorrow" },
  { sender: "Archive lane", subject: "Low-signal thread summarized and tucked away", tag: "Cleared", time: "Done" },
];

const beforeCategories = [
  { label: "Primary", count: "18", active: true },
  { label: "Promotions", count: "7", active: false },
  { label: "Social", count: "4", active: false },
  { label: "Updates", count: "12", active: false },
];

const afterCategories = [
  { label: "Primary", count: "6", active: true },
  { label: "Promotions", count: "2", active: false },
  { label: "Social", count: "1", active: false },
  { label: "Updates", count: "3", active: false },
];

function GlowButton({
  href,
  children,
  variant = "primary",
  onClick,
  disabled,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const className =
    variant === "primary"
      ? "bg-[var(--lp-accent)] text-[var(--lp-accent-fg)] shadow-[0_20px_60px_rgba(240,118,34,0.3)]"
      : "border border-[var(--lp-border)] bg-white/5 text-[var(--lp-text-primary)] backdrop-blur-xl";

  const content = (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5 ${className} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {children}
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}

function InboxPreview({
  title,
  eyebrow,
  rows,
  categories,
  after = false,
}: {
  title: string;
  eyebrow: string;
  rows: Array<{ sender: string; subject: string; tag: string; time: string }>;
  categories: Array<{ label: string; count: string; active: boolean }>;
  after?: boolean;
}) {
  return (
    <div className="rounded-[1.7rem] border border-[var(--lp-border)] bg-[var(--lp-surface-raised)]/95 p-3 shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="overflow-hidden rounded-[1.35rem] border border-[var(--lp-border-subtle)] bg-[var(--lp-surface-raised)]">
        <div className="flex items-center justify-between border-b border-[var(--lp-border-subtle)] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#ea4335]/15" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--lp-text-muted)]">
                {eyebrow}
              </p>
              <p className="text-xs font-semibold text-[var(--lp-text-primary)]">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[var(--lp-text-muted)]">
            <HugeiconsIcon icon={Search01Icon} size={14} />
            <div className="h-7 w-20 rounded-full bg-black/6" />
          </div>
        </div>

        <div className="grid min-h-[290px] grid-cols-[96px_1fr] bg-[#f5f7fb] dark:bg-[#1d1614]">
          <div className="border-r border-[var(--lp-border-subtle)] bg-[#eef3fd] px-2 py-3 dark:bg-[#221917]">
            <div className="mb-3 rounded-2xl bg-[#c9ddff] px-2 py-2 text-center text-[10px] font-semibold text-[#173860] dark:bg-[#3b2a24] dark:text-[#f7d2b3]">
              Compose
            </div>
            <div className="space-y-2 text-[10px] text-[var(--lp-text-secondary)]">
              {["Inbox", "Starred", "Snoozed", "Sent", "Drafts"].map((item, index) => (
                <div
                  key={item}
                  className={`rounded-xl px-2 py-1.5 ${
                    index === 0 ? "bg-[#d8e4fb] font-semibold text-[#1a3d6f] dark:bg-[#352722] dark:text-[#fff1e6]" : ""
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {["Priority", "Finance", "Follow Up", "Personal"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-[9px] text-[var(--lp-text-muted)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--lp-accent)]/75" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="px-3 py-3">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-8 flex-1 rounded-full bg-white/85 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-white/5" />
              <div className="h-8 w-8 rounded-full bg-white/80 dark:bg-white/5" />
            </div>

            <div className="mb-3 grid grid-cols-4 gap-2 text-[9px]">
              {categories.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl px-2 py-1.5 ${
                    item.active
                      ? "bg-white shadow-[inset_0_-2px_0_0_var(--lp-accent)] dark:bg-[#241b18]"
                      : "bg-white/60 dark:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-medium text-[var(--lp-text-secondary)]">{item.label}</span>
                    <span className="rounded-full bg-black/8 px-1.5 py-0.5 text-[8px] text-[var(--lp-text-muted)] dark:bg-white/8">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {rows.map((row) => (
                <div
                  key={`${row.sender}-${row.time}`}
                  className="grid grid-cols-[16px_76px_1fr_38px] items-center gap-2 rounded-xl bg-white/90 px-2 py-2 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)] dark:bg-[#261c19]"
                >
                  <HugeiconsIcon
                    icon={Mail02Icon}
                    size={12}
                    className="text-[var(--lp-text-muted)]"
                  />
                  <div className="min-w-0">
                    <div className={`h-2.5 rounded-full bg-black/10 dark:bg-white/10 ${after ? "w-16" : "w-16 blur-[1px]"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${
                          after
                            ? "bg-[var(--lp-accent-soft)] text-[var(--lp-accent)]"
                            : "bg-[#dbe5f7] text-[#35517f] dark:bg-[#3b2a24] dark:text-[#ffd9bb]"
                        }`}
                      >
                        {row.tag}
                      </span>
                      <div className={`h-2.5 flex-1 rounded-full bg-black/10 dark:bg-white/10 ${after ? "w-40" : "blur-[1.5px]"}`} />
                    </div>
                    <div className={`mt-1.5 h-2 rounded-full bg-black/7 dark:bg-white/8 ${after ? "w-32" : "w-40 blur-[2px]"}`} />
                  </div>
                  <div className="text-right text-[8px] font-medium text-[var(--lp-text-muted)]">
                    {after ? row.time : "••:••"}
                  </div>
                </div>
              ))}
            </div>

            {after && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Drafts", icon: Mail01Icon },
                  { label: "Calendar", icon: Calendar03Icon },
                  { label: "Vault", icon: File01Icon },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl bg-[var(--lp-accent-soft)] px-2 py-2 text-center text-[9px] font-medium text-[var(--lp-accent)]"
                  >
                    <div className="mb-1 flex justify-center">
                      <HugeiconsIcon icon={item.icon} size={12} />
                    </div>
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const saved = window.localStorage.getItem("lp-theme");
    return saved ? saved === "dark" : true;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [googleAttempt, setGoogleAttempt] = useState<GoogleSignInAttempt | null>(null);
  const router = useRouter();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroCardY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const heroCardRotate = useTransform(scrollYProgress, [0, 1], [0, -2.5]);
  const heroCardScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const heroGlowOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.45]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    window.localStorage.setItem("lp-theme", next ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

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

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="relative overflow-hidden bg-[var(--lp-bg-primary)] text-[var(--lp-text-primary)]">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="landing-noise pointer-events-none absolute inset-0 opacity-[0.08]" />
      <div className="landing-spotlight landing-spotlight-one pointer-events-none absolute" />
      <div className="landing-spotlight landing-spotlight-two pointer-events-none absolute" />

      <header className="sticky top-0 z-50 px-4 pt-4 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[var(--lp-border)] bg-[color:var(--lp-surface-glass)] px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lp-accent-soft)]">
              <SparrowMark size={24} color="var(--lp-accent)" />
            </div>
            <div className="leading-none">
              <p className="font-heading text-lg font-bold tracking-[-0.03em]">SparrowHQ</p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--lp-text-muted)]">
                Inbox command center
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-[var(--lp-text-secondary)] transition-colors hover:text-[var(--lp-text-primary)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--lp-border)] bg-white/5 text-[var(--lp-text-secondary)] transition-colors hover:text-[var(--lp-text-primary)]"
            >
              <HugeiconsIcon icon={isDark ? Sun01Icon : Moon02Icon} size={18} />
            </button>
            <GlowButton onClick={() => router.push("/outlook-coming-soon")} variant="secondary">
              Outlook soon
            </GlowButton>
            <GlowButton onClick={handleConnectGoogle} disabled={connectingGoogle}>
              {connectingGoogle ? "Connecting..." : "Connect Gmail"}
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </GlowButton>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--lp-border)] bg-white/5 md:hidden"
            aria-label="Toggle menu"
          >
            <HugeiconsIcon icon={mobileOpen ? Cancel01Icon : Menu01Icon} size={20} />
          </button>
        </div>

        {mobileOpen && (
          <div className="mx-auto mt-3 max-w-7xl rounded-[2rem] border border-[var(--lp-border)] bg-[color:var(--lp-surface-glass)] p-6 backdrop-blur-2xl md:hidden">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium text-[var(--lp-text-primary)]"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <GlowButton onClick={handleConnectGoogle} disabled={connectingGoogle}>
                {connectingGoogle ? "Connecting..." : "Connect Gmail"}
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </GlowButton>
              <GlowButton onClick={() => router.push("/outlook-coming-soon")} variant="secondary">
                Join Outlook waitlist
              </GlowButton>
            </div>
          </div>
        )}
      </header>

      {!googleAttempt?.ok && googleAttempt?.reason === "in_app_browser" && (
        <div className="fixed inset-x-4 top-24 z-[60] mx-auto w-full max-w-2xl">
          <InAppBrowserNotice
            browser={googleAttempt.browser}
            externalUrl={googleAttempt.externalUrl}
            androidIntentUrl={googleAttempt.androidIntentUrl}
            className="rounded-[1.75rem] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl"
          />
        </div>
      )}

      <main>
        <section ref={heroRef} className="relative px-4 pb-18 pt-8 md:px-6 md:pb-28 md:pt-14">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.1 } } }}
              style={{ y: heroTextY }}
              className="relative z-10 max-w-[62rem]"
            >
              <motion.div
                variants={fadeUp}
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--lp-border)] bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[var(--lp-text-secondary)] backdrop-blur-xl"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--lp-accent)]" />
                AI inbox orchestration for founder-led teams
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="max-w-[12.5ch] font-heading text-[clamp(3.5rem,7vw,7.3rem)] font-semibold leading-[0.9] tracking-[-0.065em]"
              >
                Stop managing email.
                <br />
                Start managing <em className="landing-emphasis not-italic">momentum</em>.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-7 max-w-2xl text-[1.05rem] leading-8 text-[var(--lp-text-secondary)] md:text-[1.22rem] md:leading-9"
              >
                SparrowHQ turns your inbox into an operations surface. It triages new mail,
                drafts replies with calendar and document context, and keeps attachments,
                scheduling, and follow-up work moving from one command center.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <GlowButton onClick={handleConnectGoogle} disabled={connectingGoogle}>
                  {connectingGoogle ? "Connecting..." : "Start with Gmail"}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </GlowButton>
                <GlowButton href="#platform" variant="secondary">
                  See the platform
                </GlowButton>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-10 grid max-w-4xl gap-4 text-sm text-[var(--lp-text-secondary)] sm:grid-cols-3"
              >
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[1.5rem] border border-[var(--lp-border)] bg-white/5 px-5 py-4 backdrop-blur-xl"
                  >
                    <div className="text-2xl font-semibold tracking-[-0.05em] text-[var(--lp-text-primary)]">
                      {metric.value}
                    </div>
                    <div className="mt-2 max-w-[18ch] leading-6">{metric.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as const, delay: 0.15 }}
              style={{ y: heroCardY, rotate: heroCardRotate, scale: heroCardScale }}
              className="relative mt-14 origin-top md:mt-16"
            >
              <motion.div
                style={{ opacity: heroGlowOpacity }}
                className="landing-card-outline absolute inset-0 rounded-[2.25rem]"
              />
              <div className="landing-dashboard-shell relative overflow-hidden rounded-[2.4rem] border border-[var(--lp-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-4 shadow-[0_35px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--lp-text-muted)]">
                      Dashboard transformation
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--lp-text-primary)]">
                      Familiar inbox, privacy-safe product story
                    </p>
                  </div>
                  <div className="rounded-full bg-[var(--lp-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--lp-accent)]">
                    Before / after
                  </div>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-2">
                  <div className="relative">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--lp-text-muted)]">
                        Before Sparrow
                      </p>
                      <p className="text-[11px] text-[var(--lp-text-secondary)]">
                        crowded inbox, hidden signal
                      </p>
                    </div>
                    <InboxPreview
                      title="Generic inbox snapshot"
                      eyebrow="Sanitized UI"
                      rows={beforeRows}
                      categories={beforeCategories}
                    />
                  </div>

                  <div className="relative">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--lp-text-muted)]">
                        After Sparrow
                      </p>
                      <p className="text-[11px] text-[var(--lp-text-secondary)]">
                        organized lanes, ready actions
                      </p>
                    </div>
                    <InboxPreview
                      title="Actioned inbox view"
                      eyebrow="Sparrow overlay"
                      rows={afterRows}
                      categories={afterCategories}
                      after
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="platform" className="px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--lp-text-muted)]">
                  Platform
                </p>
                <h2 className="mt-4 font-heading text-[clamp(2.4rem,4.5vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.05em]">
                  Built like an <em className="landing-emphasis not-italic">operations layer</em>,
                  not a chatbot.
                </h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-[var(--lp-text-secondary)] md:text-lg">
                The landing page now frames SparrowHQ as a product that removes inbox drag across
                communication, scheduling, attachments, and financial follow-up instead of just
                drafting generic replies.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {capabilities.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, delay: index * 0.06 }}
                  className="group rounded-[2rem] border border-[var(--lp-border)] bg-[var(--lp-panel)] p-6 transition-transform duration-300 hover:-translate-y-1.5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--lp-accent-soft)] text-[var(--lp-accent)]">
                    <HugeiconsIcon icon={item.icon} size={26} />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--lp-text-secondary)]">{item.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2.25rem] border border-[var(--lp-border)] bg-[linear-gradient(180deg,rgba(247,123,34,0.15),rgba(255,255,255,0.03))] p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--lp-text-muted)]">
                Workflow architecture
              </p>
              <h2 className="mt-4 max-w-lg font-heading text-[clamp(2.3rem,4vw,4rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
                Every message moves through a <em className="landing-emphasis not-italic">clear
                system</em>.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[var(--lp-text-secondary)]">
                Instead of adding another inbox view, Sparrow creates a pipeline from arrival to
                decision. That makes the product easier to trust and much easier to explain.
              </p>

              <div className="mt-8 rounded-[1.75rem] border border-[var(--lp-border)] bg-black/10 p-5">
                <div className="flex items-center gap-3 text-sm text-[var(--lp-text-secondary)]">
                  <HugeiconsIcon icon={CustomerSupportIcon} size={18} className="text-[var(--lp-accent)]" />
                  Assistive, review-first automation
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--lp-text-secondary)]">
                  {[
                    "Protects final human approval",
                    "Surfaces why a draft was suggested",
                    "Keeps related files and next actions in one place",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/6 px-4 py-3">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-[var(--lp-accent)]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {workflow.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, delay: index * 0.07 }}
                  className="rounded-[2rem] border border-[var(--lp-border)] bg-[var(--lp-panel)] p-6 md:p-8"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-[var(--lp-text-muted)]">
                        {item.eyebrow}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
                        {item.title}
                      </h3>
                    </div>
                    <p className="max-w-xl text-sm leading-7 text-[var(--lp-text-secondary)] md:text-base">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="proof" className="px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--lp-text-muted)]">
                Product proof
              </p>
              <h2 className="mt-4 font-heading text-[clamp(2.3rem,4.2vw,4rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
                The page now sells a <em className="landing-emphasis not-italic">working system</em>,
                not a feature list.
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {proofCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="relative overflow-hidden rounded-[2rem] border border-[var(--lp-border)] bg-[var(--lp-panel)] p-6"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/15 text-[var(--lp-text-primary)]">
                      <HugeiconsIcon icon={card.icon} size={25} />
                    </div>
                    <p className="mt-8 text-xs uppercase tracking-[0.28em] text-[var(--lp-text-muted)]">
                      {card.title}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{card.subtitle}</h3>
                    <p className="mt-4 text-sm leading-7 text-[var(--lp-text-secondary)]">{card.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2.25rem] border border-[var(--lp-border)] bg-[var(--lp-panel)] p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--lp-text-muted)]">
                Customer signal
              </p>
              <h2 className="mt-4 font-heading text-[clamp(2rem,3.8vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
                Confidence comes from clarity.
              </h2>
              <p className="mt-5 text-base leading-7 text-[var(--lp-text-secondary)]">
                A stronger landing page is not just prettier. It makes the promise, system, and
                trust model legible in a few seconds for a new buyer.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {testimonials.map((item) => (
                <div
                  key={item.name}
                  className="rounded-[2rem] border border-[var(--lp-border)] bg-[var(--lp-panel)] p-6"
                >
                  <p className="text-base leading-8 text-[var(--lp-text-primary)]">&ldquo;{item.quote}&rdquo;</p>
                  <div className="mt-8 border-t border-[var(--lp-border)] pt-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-[var(--lp-text-secondary)]">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--lp-text-muted)]">FAQ</p>
              <h2 className="mt-4 font-heading text-[clamp(2.2rem,4vw,3.8rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
                Everything a buyer needs to believe in under a minute.
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[1.8rem] border border-[var(--lp-border)] bg-[var(--lp-panel)] p-6"
                >
                  <h3 className="text-xl font-semibold tracking-[-0.03em]">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--lp-text-secondary)] md:text-base">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 pt-4 md:px-6 md:pb-20">
          <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-[var(--lp-border)] bg-[linear-gradient(145deg,rgba(247,123,34,0.18),rgba(255,255,255,0.05))] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.3)] md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--lp-text-muted)]">
                  Final CTA
                </p>
                <h2 className="mt-4 max-w-3xl font-heading text-[clamp(2.5rem,4.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
                  Turn your inbox into a <em className="landing-emphasis not-italic">decision
                  engine</em>.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--lp-text-secondary)] md:text-lg">
                  Connect Gmail, let SparrowHQ build structure around your incoming mail, and
                  start replying with context instead of friction.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <GlowButton onClick={handleConnectGoogle} disabled={connectingGoogle}>
                  {connectingGoogle ? "Connecting..." : "Connect Gmail"}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </GlowButton>
                <GlowButton onClick={() => router.push("/outlook-coming-soon")} variant="secondary">
                  Outlook waitlist
                </GlowButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 pb-10 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-[var(--lp-border)] pt-6 text-sm text-[var(--lp-text-secondary)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <SparrowMark size={18} color="var(--lp-accent)" />
            <span>SparrowHQ</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
          <p>{year} SparrowHQ. Built for calmer operations.</p>
        </div>
      </footer>
    </div>
  );
}
