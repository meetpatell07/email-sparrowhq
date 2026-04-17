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
  GoogleDriveIcon,
  Invoice01Icon,
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

const gmailCategories = [
  { label: "Primary", badge: null, preview: "" },
  { label: "Promotions", badge: "7 new", preview: "hidden promotional preview" },
  { label: "Social", badge: "1 new", preview: "hidden social preview" },
  { label: "Updates", badge: "30 new", preview: "hidden update preview" },
];

const gmailLabels = [
  { label: "Finance", count: "1", color: "#1a8f5a" },
  { label: "Follow Up", count: "1", color: "#3065c8" },
  { label: "Marketing", count: "9", color: "#b23a1f" },
  { label: "Notes", count: "", color: "#505050" },
  { label: "Notification", count: "8", color: "#f4ab45" },
  { label: "Personal", count: "2", color: "#8d63d5" },
  { label: "Planned", count: "", color: "#3ca86d" },
  { label: "Priority", count: "", color: "#f16143" },
];

const gmailRows = [
  { tag: "Notification", tagColor: "#f4aa42", selected: false, attachment: false, actionOpen: false },
  { tag: "Notification", tagColor: "#f4aa42", selected: false, attachment: false, actionOpen: false },
  { tag: "Notification", tagColor: "#f4aa42", selected: false, attachment: false, actionOpen: false },
  { tag: "Notification", tagColor: "#f4aa42", selected: false, attachment: false, actionOpen: false },
  { tag: "Marketing", tagColor: "#b23a1f", selected: true, attachment: false, actionOpen: true },
  { tag: "Marketing", tagColor: "#b23a1f", selected: false, attachment: false, actionOpen: false },
  { tag: "Notification", tagColor: "#f4aa42", selected: false, attachment: false, actionOpen: false },
  { tag: "Notification", tagColor: "#f4aa42", selected: false, attachment: false, actionOpen: false },
  { tag: "Follow Up", tagColor: "#3065c8", selected: true, attachment: false, actionOpen: false },
  { tag: "Follow Up", tagColor: "#3065c8", selected: false, attachment: false, actionOpen: false },
  { tag: "Finance", tagColor: "#1a8f5a", selected: false, attachment: true, actionOpen: false },
  { tag: "Follow Up", tagColor: "#3065c8", selected: true, attachment: false, actionOpen: false },
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

function GmailDashboardMock() {
  return (
    <div className="rounded-[1.8rem] border border-[var(--lp-border)] bg-[#eef3fb] p-3 shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:bg-[#221816]">
      <div className="overflow-hidden rounded-[1.45rem] border border-black/6 bg-[#f8fafd] shadow-[0_8px_30px_rgba(31,41,55,0.08)] dark:border-white/8 dark:bg-[#1f1614]">
        <div className="flex items-center justify-between gap-4 border-b border-black/6 px-4 py-3 dark:border-white/8">
          <div className="flex min-w-0 items-center gap-3">
            <HugeiconsIcon icon={Menu01Icon} size={18} className="shrink-0 text-[#4b5563] dark:text-[#d7c0b0]" />
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 grid-cols-2 gap-[2px] rounded-[8px] bg-white p-1 shadow-sm dark:bg-[#2a1e1a]">
                <span className="rounded-sm bg-[#ea4335]" />
                <span className="rounded-sm bg-[#fbbc05]" />
                <span className="rounded-sm bg-[#4285f4]" />
                <span className="rounded-sm bg-[#34a853]" />
              </div>
              <span className="text-[2rem] font-medium tracking-[-0.04em] text-[#4b5563] dark:text-[#f6e9dd]">Gmail</span>
            </div>
          </div>
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex w-full max-w-[36rem] items-center gap-3 rounded-full bg-[#e9effa] px-5 py-3 text-[#5f6368] dark:bg-[#2a211d] dark:text-[#e6d2c3]">
              <HugeiconsIcon icon={Search01Icon} size={18} />
              <span className="text-lg">Search mail</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[#4b5563] dark:text-[#d7c0b0]">
            <div className="hidden rounded-full bg-[#d8e5fb] px-5 py-2 text-sm font-semibold text-[#173860] md:block dark:bg-[#3b2a24] dark:text-[#ffe7d2]">
              Upgrade
            </div>
            <div className="h-8 w-8 rounded-full border border-black/8 bg-white dark:border-white/10 dark:bg-[#2a1e1a]" />
          </div>
        </div>

        <div className="grid min-h-[36rem] grid-cols-[15rem_1fr_2.5rem] bg-[#f8fafd] dark:bg-[#1f1614]">
          <div className="border-r border-black/6 px-4 py-4 dark:border-white/8">
            <div className="mb-8 inline-flex w-full items-center gap-3 rounded-[1.4rem] bg-[#c9e4fb] px-5 py-5 text-[#0f172a] dark:bg-[#3b2a24] dark:text-[#ffe7d2]">
              <div className="h-6 w-6 rounded-[6px] border-[3px] border-current border-r-transparent rotate-45" />
              <span className="text-[1rem] font-medium">Compose</span>
            </div>

            <div className="space-y-2 text-[0.98rem] text-[#4b5563] dark:text-[#dcc7b8]">
              {[
                ["Inbox", "18,676", true],
                ["Starred", "", false],
                ["Snoozed", "", false],
                ["Sent", "", false],
                ["Drafts", "96", false],
                ["Purchases", "512", false],
                ["More", "", false],
              ].map(([label, count, active]) => (
                <div
                  key={label}
                  className={`flex items-center justify-between rounded-r-full px-4 py-2.5 ${
                    active ? "bg-[#d8e5fb] font-semibold text-[#173860] dark:bg-[#352722] dark:text-[#fff0e4]" : ""
                  }`}
                >
                  <span>{label}</span>
                  {count ? <span>{count}</span> : null}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between text-[1rem] font-medium text-[#40464d] dark:text-[#f6e9dd]">
                <span>Labels</span>
                <span className="text-2xl font-light">+</span>
              </div>
              <div className="space-y-2.5 text-[0.98rem] text-[#4b5563] dark:text-[#dcc7b8]">
                {gmailLabels.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 px-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3.5 w-5 rounded-r-full" style={{ backgroundColor: item.color }} />
                      <span>{item.label}</span>
                    </div>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#201715]">
            <div className="flex items-center justify-between px-6 py-5 text-[#5f6368] dark:text-[#dcc7b8]">
              <div className="flex items-center gap-5 text-xl">
                <div className="h-7 w-7 rounded-[4px] border-[3px] border-current" />
                <span className="text-3xl leading-none">↻</span>
                <span className="text-3xl leading-none">⋮</span>
              </div>
              <div className="flex items-center gap-6 text-[1rem]">
                <span>1–50 of 22,922</span>
                <span className="text-2xl leading-none">‹</span>
                <span className="text-2xl leading-none">›</span>
              </div>
            </div>

            <div className="grid grid-cols-4 border-b border-black/8 dark:border-white/8">
              {gmailCategories.map((item, index) => (
                <div key={item.label} className={`px-8 py-4 ${index === 0 ? "border-b-[3px] border-[#3065c8]" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-[1.15rem] ${index === 0 ? "font-medium text-[#3065c8]" : "text-[#4b5563] dark:text-[#e1d0c2]"}`}>
                      {item.label}
                    </span>
                    {item.badge ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.82rem] font-semibold text-white ${
                          item.label === "Promotions"
                            ? "bg-[#2d8f4e]"
                            : item.label === "Social"
                              ? "bg-[#3175e7]"
                              : "bg-[#df7b1b]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  {item.preview ? <div className="mt-1 h-4 w-40 rounded-full bg-black/8 blur-[1px] dark:bg-white/10" /> : null}
                </div>
              ))}
            </div>

            <div>
              {gmailRows.map((row, index) => (
                <div
                  key={`${row.tag}-${index}`}
                  className={`border-b border-black/7 px-6 py-3.5 dark:border-white/7 ${
                    row.selected ? "bg-[#f3f6fc] shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)] dark:bg-[#2a1f1c]" : "bg-white dark:bg-[#201715]"
                  }`}
                >
                  <div className="grid grid-cols-[2rem_2rem_13rem_7rem_1fr_5rem] items-center gap-3 text-[#202124] dark:text-[#f7ebdf]">
                    <div className="h-6 w-6 rounded-[4px] border-2 border-[#c4c7c5] dark:border-[#8f776b]" />
                    <div className="text-[#c4c7c5] dark:text-[#8f776b]">☆</div>
                    <div className="h-5 w-32 rounded-full bg-black/10 blur-[1.6px] dark:bg-white/10" />
                    <span
                      className="inline-flex w-fit rounded-[8px] px-2 py-1 text-[0.9rem] font-medium text-white"
                      style={{ backgroundColor: row.tagColor }}
                    >
                      {row.tag}
                    </span>
                    <div className="min-w-0">
                      <div className="h-5 w-[85%] rounded-full bg-black/10 blur-[1.8px] dark:bg-white/10" />
                      {row.attachment ? (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="rounded-full bg-[#f1f5f9] px-4 py-2 text-sm text-[#64748b] dark:bg-[#312521] dark:text-[#f4dcc8]">
                            PDF
                          </div>
                          <div className="h-4 w-28 rounded-full bg-black/10 blur-[1.6px] dark:bg-white/10" />
                        </div>
                      ) : null}
                    </div>
                    <div className="text-right text-[1rem] font-medium text-[#3c4043] dark:text-[#f2dfd0]">
                      {row.selected ? "4 Apr" : "••:••"}
                    </div>
                  </div>

                  {row.actionOpen ? (
                    <div className="mt-3 flex items-center justify-end gap-3 text-[#5f6368] dark:text-[#dcc7b8]">
                      <div className="rounded-[10px] border border-black/10 px-3 py-1.5 text-sm dark:border-white/10">
                        Unsubscribe
                      </div>
                      <div className="h-8 w-8 rounded-lg border border-black/10 dark:border-white/10" />
                      <div className="h-8 w-8 rounded-lg border border-black/10 dark:border-white/10" />
                      <div className="h-8 w-8 rounded-lg border border-black/10 dark:border-white/10" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="border-l border-black/6 bg-[#f8fafd] px-2 py-10 dark:border-white/8 dark:bg-[#1f1614]">
            <div className="space-y-8">
              {["#4285f4", "#fbbc05", "#4285f4"].map((color, index) => (
                <div key={`${color}-${index}`} className="mx-auto h-8 w-8 rounded-xl" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-black/6 bg-[#f8fafd] px-4 py-3 dark:border-white/8 dark:bg-[#1f1614]">
          <div className="text-3xl leading-none text-[#5f6368] dark:text-[#dcc7b8]">+</div>
          <div className="rounded-[1rem] bg-[#edf2fc] px-5 py-3 text-[1.2rem] text-[#233a5f] shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:bg-[#312521] dark:text-[#ffe7d2]">
            Sharing Document: <span className="blur-[2px]">Sensitive file name</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const saved = window.localStorage.getItem("lp-theme");
    return saved ? saved === "dark" : false;
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
                      Gmail-style workspace
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--lp-text-primary)]">
                      Exact layout, with only sensitive thread data obscured
                    </p>
                  </div>
                  <div className="rounded-full bg-[var(--lp-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--lp-accent)]">
                    Privacy-safe mock
                  </div>
                </div>

                <div className="mt-6">
                  <GmailDashboardMock />
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
