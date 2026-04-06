"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { SparrowMark } from "./Logo";

gsap.registerPlugin(ScrollTrigger);

// ── Step definitions ────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Connect your inbox",
    description:
      "Sign in once with Google and SparrowHQ syncs your Gmail instantly — no forwarding rules, no plugins, no scripts. Your inbox is live in under 30 seconds.",
    accent: "#6366f1",
    tag: "One-click OAuth",
  },
  {
    number: "02",
    title: "AI reads every email",
    description:
      "The moment a message arrives, it's classified into Urgent, Client, Invoice, Personal, Marketing, or Notification with 98% accuracy — and the label is applied directly in Gmail.",
    accent: "#0284C7",
    tag: "Real-time classification",
  },
  {
    number: "03",
    title: "Drafts appear, ready to approve",
    description:
      "For urgent and client emails, SparrowHQ writes a context-aware reply — it even checks your calendar for free slots. One click to approve, one click to send.",
    accent: "#059669",
    tag: "Calendar-aware AI replies",
  },
  {
    number: "04",
    title: "Stay effortlessly organised",
    description:
      "Labels sync back to Gmail. Invoices are logged with vendor, amount and due date. Your inbox categories give you a live snapshot of everything that needs attention.",
    accent: "#EA580C",
    tag: "Zero-maintenance inbox",
  },
];

// ── Mock UI visuals ─────────────────────────────────────────────────────────

function VisualConnect() {
  return (
    <div
      className="rounded-2xl border p-6 space-y-4 w-full"
      style={{ background: "var(--lp-surface)", borderColor: "var(--lp-border)" }}
    >
      <div className="flex items-center gap-2.5">
        <SparrowMark size={22} color="var(--lp-text-primary)" />
        <span className="font-heading font-bold text-[14px]" style={{ color: "var(--lp-text-primary)" }}>
          SparrowHQ
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <span className="font-body text-[11px]" style={{ color: "var(--lp-text-muted)" }}>
            Connected
          </span>
        </div>
      </div>

      <div
        className="rounded-xl border p-3.5 flex items-center gap-3"
        style={{ background: "var(--lp-surface-raised)", borderColor: "var(--lp-border-subtle)" }}
      >
        <div className="w-10 h-10 rounded-full bg-[#4285F4]/20 flex items-center justify-center shrink-0">
          <span className="font-heading font-bold text-[15px] text-[#4285F4]">J</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body font-medium text-[12px] truncate" style={{ color: "var(--lp-text-primary)" }}>
            john@company.com
          </p>
          <p className="font-body text-[11px]" style={{ color: "var(--lp-text-muted)" }}>
            Gmail · Calendar · Drive
          </p>
        </div>
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] text-emerald-400"
          style={{ background: "rgba(52,211,153,0.12)" }}
        >
          ✓
        </div>
      </div>

      <div className="space-y-2.5">
        {[
          { label: "Inbox synced", pct: 100, done: true },
          { label: "AI classification applied", pct: 100, done: true },
          { label: "Creating Gmail labels…", pct: 74, done: false, active: true },
        ].map((item, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span
                className="font-body text-[11px]"
                style={{ color: item.done ? "var(--lp-text-muted)" : "var(--lp-text-secondary)" }}
              >
                {item.label}
              </span>
              <span className="font-body text-[11px] tabular-nums" style={{ color: "var(--lp-text-muted)" }}>
                {item.pct}%
              </span>
            </div>
            <div className="h-[3px] rounded-full" style={{ background: "var(--lp-border)" }}>
              <div
                className="h-[3px] rounded-full"
                style={{
                  width: `${item.pct}%`,
                  background: item.active ? "#6366f1" : "var(--lp-text-muted)",
                  transition: "width 1.2s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualClassify() {
  const rows = [
    { from: "Sarah Chen", subject: "Q2 proposal needs your sign-off", cat: "urgent", color: "#fb4c2f" },
    { from: "Amazon AWS", subject: "Invoice #INV-9842 — $2,400.00", cat: "invoice", color: "#16a765" },
    { from: "Alex Kim", subject: "Re: Product launch timeline", cat: "client", color: "#285bac" },
    { from: "Mailchimp", subject: "Your April campaign stats are in", cat: "marketing", color: "#ac2b16" },
    { from: "GitHub", subject: "Scheduled maintenance this Sunday", cat: "notification", color: "#f2a60c" },
  ];

  return (
    <div
      className="rounded-2xl border overflow-hidden w-full"
      style={{ background: "var(--lp-surface)", borderColor: "var(--lp-border)" }}
    >
      <div
        className="px-4 py-2.5 border-b flex items-center"
        style={{ borderColor: "var(--lp-border-subtle)", background: "var(--lp-surface-raised)" }}
      >
        <span className="font-body font-medium text-[12px]" style={{ color: "var(--lp-text-primary)" }}>
          Inbox
        </span>
        <span className="ml-auto font-body text-[11px]" style={{ color: "var(--lp-text-muted)" }}>
          5 classified
        </span>
      </div>
      {rows.map((row, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.09, duration: 0.28 }}
          className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0"
          style={{ borderColor: "var(--lp-border-subtle)" }}
        >
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
          <div className="flex-1 min-w-0">
            <p className="font-body text-[12px] font-medium truncate" style={{ color: "var(--lp-text-primary)" }}>
              {row.from}
            </p>
            <p className="font-body text-[11px] truncate" style={{ color: "var(--lp-text-muted)" }}>
              {row.subject}
            </p>
          </div>
          <span
            className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-sm shrink-0 uppercase tracking-wide"
            style={{ background: `${row.color}22`, color: row.color }}
          >
            {row.cat}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function VisualDraft() {
  return (
    <div
      className="rounded-2xl border overflow-hidden w-full"
      style={{ background: "var(--lp-surface)", borderColor: "var(--lp-border)" }}
    >
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: "var(--lp-border-subtle)", background: "var(--lp-surface-raised)" }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-body text-[11px]" style={{ color: "var(--lp-text-muted)" }}>
            Draft reply ·{" "}
            <span className="font-medium" style={{ color: "var(--lp-text-secondary)" }}>
              urgent
            </span>
          </span>
          <span
            className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-sm"
            style={{ background: "#6366f115", color: "#818cf8" }}
          >
            ✦ AI Generated
          </span>
        </div>
        <p className="font-body font-medium text-[13px]" style={{ color: "var(--lp-text-primary)" }}>
          Re: Q2 proposal needs your sign-off
        </p>
        <p className="font-body text-[11px]" style={{ color: "var(--lp-text-muted)" }}>
          To: sarah.chen@company.com
        </p>
      </div>

      <div className="px-4 py-4">
        <p className="font-body text-[13px] leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
          Hi Sarah,
          <br />
          <br />
          Thanks for sending this over — I've reviewed the proposal. I'm available tomorrow between{" "}
          <strong style={{ color: "var(--lp-text-primary)" }}>10 – 12 am</strong> or{" "}
          <strong style={{ color: "var(--lp-text-primary)" }}>3 – 5 pm</strong> to walk through the
          details. Does either work for you?
          <br />
          <br />
          Best,
        </p>
      </div>

      <div
        className="px-4 py-3 border-t flex gap-2"
        style={{ borderColor: "var(--lp-border-subtle)" }}
      >
        <button
          className="flex-1 py-2 rounded-lg text-[12px] font-body font-semibold text-center"
          style={{ background: "var(--lp-accent)", color: "var(--lp-accent-fg)" }}
        >
          Approve &amp; Send
        </button>
        <button
          className="px-3 py-2 rounded-lg text-[12px] font-body border"
          style={{
            background: "var(--lp-surface-raised)",
            color: "var(--lp-text-muted)",
            borderColor: "var(--lp-border)",
          }}
        >
          Edit
        </button>
        <button
          className="px-3 py-2 rounded-lg text-[12px] font-body border"
          style={{
            background: "var(--lp-surface-raised)",
            color: "var(--lp-text-muted)",
            borderColor: "var(--lp-border)",
          }}
        >
          Discard
        </button>
      </div>
    </div>
  );
}

function VisualOrganise() {
  const cats = [
    { label: "Urgent", count: 3, color: "#fb4c2f" },
    { label: "Client", count: 12, color: "#285bac" },
    { label: "Invoice", count: 5, color: "#16a765" },
    { label: "Personal", count: 8, color: "#8e63ce" },
    { label: "Marketing", count: 24, color: "#ac2b16" },
    { label: "Notification", count: 17, color: "#f2a60c" },
  ];

  return (
    <div
      className="rounded-2xl border overflow-hidden w-full"
      style={{ background: "var(--lp-surface)", borderColor: "var(--lp-border)" }}
    >
      <div
        className="px-4 py-2.5 border-b flex items-center gap-2"
        style={{ borderColor: "var(--lp-border-subtle)", background: "var(--lp-surface-raised)" }}
      >
        <span className="font-body font-medium text-[12px]" style={{ color: "var(--lp-text-primary)" }}>
          Categories
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          <span className="font-body text-[11px]" style={{ color: "var(--lp-text-muted)" }}>
            Synced to Gmail
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {cats.map((cat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.055, duration: 0.3, ease: "backOut" }}
            className="rounded-xl p-3 flex items-center justify-between"
            style={{
              background: `${cat.color}14`,
              border: `1px solid ${cat.color}28`,
            }}
          >
            <span className="font-body text-[12px] font-medium" style={{ color: cat.color }}>
              {cat.label}
            </span>
            <span className="font-heading font-black text-[18px] leading-none tabular-nums" style={{ color: cat.color }}>
              {cat.count}
            </span>
          </motion.div>
        ))}
      </div>
      <div
        className="px-4 py-3 border-t flex items-center gap-2"
        style={{ borderColor: "var(--lp-border-subtle)" }}
      >
        <span className="font-body text-[11px]" style={{ color: "var(--lp-text-muted)" }}>
          5 invoices logged · 3 urgent flagged · 2 drafts pending
        </span>
      </div>
    </div>
  );
}

const visuals = [
  <VisualConnect key="connect" />,
  <VisualClassify key="classify" />,
  <VisualDraft key="draft" />,
  <VisualOrganise key="organise" />,
];

// ── Main section ────────────────────────────────────────────────────────────

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading clip-path reveal — reverses when scrolling back up
      gsap.fromTo(
        headingRef.current,
        { clipPath: "inset(0 0 100% 0)", y: 16 },
        {
          clipPath: "inset(0 0 0% 0)",
          y: 0,
          duration: 0.85,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 82%",
            end: "top 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Timeline line draw — scrub ties draw progress to scroll (bidirectional by nature)
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 1,
          },
        }
      );

      // Each step slides up — reverses as you scroll back past it
      stepRefs.current.forEach((el, i) => {
        if (!el) return;

        gsap.fromTo(
          el,
          { y: 22, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "top 10%",
              toggleActions: "play reverse play reverse",
            },
          }
        );

        // Active step tracking (unchanged)
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => setActiveStep(i),
          onEnterBack: () => setActiveStep(i),
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="py-24 md:py-32 relative"
      style={{ background: "var(--lp-bg-primary)" }}
    >
      {/* Subtle gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(99,102,241,0.08), transparent)",
        }}
      />

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 relative">
        {/* Section label + heading */}
        <div className="mb-16 md:mb-24 max-w-2xl">
          <p
            className="font-body text-[11px] font-semibold uppercase tracking-widest mb-5"
            style={{ color: "var(--lp-text-muted)" }}
          >
            How it works
          </p>
          <h2
            ref={headingRef}
            className="font-heading font-bold tracking-tight"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              color: "var(--lp-text-primary)",
              lineHeight: 1.08,
            }}
          >
            From chaos to clarity
            <br />
            in{" "}
            <em className="not-italic" style={{ color: "#6366f1" }}>
              four steps
            </em>
          </h2>
        </div>

        {/* Main layout: Steps (left) + Sticky visual (right) */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 lg:gap-24">
          {/* ── Left: numbered steps ── */}
          <div className="md:w-1/2 relative">
            {/* Vertical timeline line */}
            <div
              className="hidden md:block absolute left-[19px] top-0 bottom-0 w-[1px]"
              style={{ background: "var(--lp-border-subtle)" }}
            >
              <div
                ref={lineRef}
                className="absolute inset-0 w-full"
                style={{
                  background: `linear-gradient(to bottom, #6366f1, #0284C7, #059669, #EA580C)`,
                  transformOrigin: "top",
                }}
              />
            </div>

            {steps.map((step, i) => (
              <div
                key={i}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="relative flex gap-6 md:gap-8 pb-24 md:pb-40 last:pb-0 cursor-default"
              >
                {/* Step dot */}
                <div className="hidden md:flex flex-col items-center shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 border"
                    style={{
                      background:
                        activeStep === i ? step.accent : "var(--lp-surface)",
                      borderColor:
                        activeStep === i ? step.accent : "var(--lp-border)",
                      boxShadow:
                        activeStep === i
                          ? `0 0 0 4px ${step.accent}22`
                          : "none",
                    }}
                  >
                    <span
                      className="font-heading font-black text-[13px] tabular-nums"
                      style={{
                        color: activeStep === i ? "#fff" : "var(--lp-text-muted)",
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>
                </div>

                {/* Step text */}
                <div
                  className="flex-1 transition-all duration-500 pt-1"
                  style={{ opacity: activeStep === i ? 1 : 0.38 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {/* Mobile step number */}
                    <span
                      className="md:hidden font-heading font-black text-[3rem] leading-none tabular-nums"
                      style={{ color: activeStep === i ? step.accent : "var(--lp-border)" }}
                    >
                      {step.number}
                    </span>
                    <span
                      className="hidden md:inline font-body text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm"
                      style={{ background: `${step.accent}18`, color: step.accent }}
                    >
                      {step.tag}
                    </span>
                  </div>

                  <h3
                    className="font-heading font-bold text-[1.4rem] md:text-[1.6rem] mb-3 leading-snug"
                    style={{ color: "var(--lp-text-primary)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="font-body text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--lp-text-secondary)" }}
                  >
                    {step.description}
                  </p>

                  {/* Mobile visual (shown inline on small screens) */}
                  <div className="md:hidden mt-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3 }}
                      >
                        {visuals[i]}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Right: sticky visual panel ── */}
          <div className="hidden md:flex md:w-1/2">
            <div
              className="sticky self-start w-full"
              style={{ top: "calc(50vh - 220px)" }}
            >
              {/* Floating label */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-1.5 h-1.5 rounded-full transition-colors duration-500"
                  style={{ background: steps[activeStep].accent }}
                />
                <span
                  className="font-body text-[11px] font-semibold uppercase tracking-widest transition-colors duration-500"
                  style={{ color: steps[activeStep].accent }}
                >
                  Step {activeStep + 1} — {steps[activeStep].tag}
                </span>
              </div>

              {/* Visual card with animated swap */}
              <div className="relative">
                {/* Glow behind card */}
                <div
                  className="absolute -inset-4 rounded-3xl blur-2xl opacity-20 transition-colors duration-700 pointer-events-none"
                  style={{ background: steps[activeStep].accent }}
                />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.97 }}
                    transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative"
                  >
                    {visuals[activeStep]}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Step dots nav */}
              <div className="flex items-center gap-2 mt-6 justify-center">
                {steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveStep(i);
                      stepRefs.current[i]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: activeStep === i ? "24px" : "6px",
                      height: "6px",
                      background:
                        activeStep === i ? s.accent : "var(--lp-border)",
                    }}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
