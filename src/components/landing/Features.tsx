"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SparklesIcon,
  Mail01Icon,
  Invoice01Icon,
  Calendar01Icon,
  BubbleChatIcon,
  Archive01Icon,
  GoogleDriveIcon,
  BrowserIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: SparklesIcon,
    title: "Smart Classification",
    body: "Every email is instantly labelled — Important, Follow-up, Finance, Personal, Marketing, or Notification — the moment it arrives. Labels sync back to Gmail in real-time.",
    accent: "#6366f1",
  },
  {
    icon: Mail01Icon,
    title: "Human-Quality AI Drafts",
    body: "AI writes structured reply drafts — greeting, body, closing, sign-off — saved directly to Gmail Drafts. You approve, it sends. Nothing leaves without your say.",
    accent: "#0284C7",
  },
  {
    icon: Invoice01Icon,
    title: "Invoice Extraction",
    body: "Detects invoice emails and pulls vendor name, amount, currency, and due date automatically. No more manual spreadsheet entries.",
    accent: "#059669",
  },
  {
    icon: Calendar01Icon,
    title: "Calendar-Aware Replies",
    body: "Before drafting, the AI checks your Google Calendar. It references your actual free slots so scheduling suggestions are always accurate.",
    accent: "#D97706",
  },
  {
    icon: BubbleChatIcon,
    title: "Natural Language AI Chat",
    body: "Ask anything in plain English: check your schedule, draft a reply, create a meeting, or summarise a thread. Your inbox, commanded by conversation.",
    accent: "#7C3AED",
  },
  {
    icon: Archive01Icon,
    title: "Vault — Attachment Storage",
    body: "Every email attachment is automatically saved to the Vault and backed up to Google Drive. Searchable by filename, type, or date. Nothing gets buried again.",
    accent: "#EA580C",
  },
];

const heroFeature = {
  icon: BrowserIcon,
  title: "Draft from anywhere — Chrome Extension",
  body: "Open any webpage — a job posting, a pricing page, a LinkedIn profile — and SparrowHQ reads the page context, takes your intent, and drops a fully structured draft into Gmail Drafts in seconds.",
  accent: "#4285F4",
  tag: "Available now",
};

const driveFeature = {
  icon: GoogleDriveIcon,
  title: "Google Drive — Draft from Documents",
  body: "Connect a Drive document and instruct the AI to write an email using its contents. Proposals, specs, contracts — the AI summarises and drafts a covering email automatically.",
  accent: "#0F9D58",
};

export function Features() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const headingRef  = useRef<HTMLHeadingElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const gridRef     = useRef<HTMLDivElement>(null);
  const driveRef    = useRef<HTMLDivElement>(null);
  const bgOrb1      = useRef<HTMLDivElement>(null);
  const bgOrb2      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Parallax orbs — scrub is inherently bidirectional ─────────────────
      gsap.to(bgOrb1.current, {
        y: -80,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.8,
        },
      });
      gsap.to(bgOrb2.current, {
        y: 60,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2.5,
        },
      });

      // ── Section heading ────────────────────────────────────────────────────
      gsap.fromTo(
        headingRef.current,
        { clipPath: "inset(0 0 100% 0)", y: 16 },
        {
          clipPath: "inset(0 0 0% 0)",
          y: 0,
          duration: 0.8,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            end: "top 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
      gsap.fromTo(
        subRef.current,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: subRef.current,
            start: "top 87%",
            end: "top 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // ── Hero feature card ─────────────────────────────────────────────────
      gsap.fromTo(
        heroCardRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: heroCardRef.current,
            start: "top 85%",
            end: "top 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // ── Grid cards — each card has its own trigger, staggered by position ─
      const cards = gsap.utils.toArray<HTMLElement>(
        gridRef.current?.children ?? []
      );
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              end: "top 10%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });

      // ── Drive card ────────────────────────────────────────────────────────
      gsap.fromTo(
        driveRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: driveRef.current,
            start: "top 88%",
            end: "top 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: "var(--lp-bg-primary)" }}
    >
      {/* Parallax background orbs */}
      <div
        ref={bgOrb1}
        className="pointer-events-none absolute -top-32 -left-40 w-[560px] h-[560px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
      />
      <div
        ref={bgOrb2}
        className="pointer-events-none absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #0284C7, transparent 70%)" }}
      />

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 relative">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[12px] font-body font-medium uppercase tracking-widest mb-4" style={{ color: "var(--lp-text-muted)" }}>
            Features
          </p>
          <h2
            ref={headingRef}
            className="font-heading font-bold tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", color: "var(--lp-text-primary)", lineHeight: 1.1 }}
          >
            Everything your inbox{" "}
            <em className="not-italic" style={{ color: "#6366f1" }}>deserves</em>
          </h2>
          <p
            ref={subRef}
            className="mt-4 text-[1.05rem] font-body max-w-xl mx-auto"
            style={{ color: "var(--lp-text-secondary)" }}
          >
            From the moment an email arrives to the second a reply leaves — SparrowHQ handles the whole flow.
          </p>
        </div>

        {/* Hero feature card */}
        <div ref={heroCardRef} className="mb-4">
          <div
            className="rounded-2xl border p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${heroFeature.accent}0e 0%, var(--lp-surface) 60%)`,
              borderColor: `${heroFeature.accent}38`,
            }}
          >
            <div
              className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-[0.15]"
              style={{ background: heroFeature.accent }}
            />

            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${heroFeature.accent}18` }}
            >
              <HugeiconsIcon icon={heroFeature.icon} size={28} style={{ color: heroFeature.accent }} strokeWidth={1.5} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="font-heading font-bold text-[1.25rem]" style={{ color: "var(--lp-text-primary)" }}>
                  {heroFeature.title}
                </h3>
                <span
                  className="text-[11px] font-body font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ background: `${heroFeature.accent}18`, color: heroFeature.accent }}
                >
                  {heroFeature.tag}
                </span>
              </div>
              <p className="font-body text-[0.9375rem] leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
                {heroFeature.body}
              </p>
            </div>

            <motion.a
              href="#"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
              className="shrink-0 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-body font-medium text-[14px]"
              style={{ borderColor: `${heroFeature.accent}45`, color: heroFeature.accent, background: `${heroFeature.accent}0e` }}
            >
              Learn more <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </motion.a>
          </div>
        </div>

        {/* 6-card grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="rounded-2xl border p-7 cursor-default relative overflow-hidden group"
              style={{ background: "var(--lp-surface)", borderColor: "var(--lp-border)" }}
            >
              {/* Subtle hover glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(ellipse at top left, ${f.accent}0c, transparent 55%)` }}
              />

              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${f.accent}16` }}
              >
                <HugeiconsIcon icon={f.icon} size={22} style={{ color: f.accent }} strokeWidth={1.5} />
              </div>
              <h3 className="font-heading font-semibold text-[1.05rem] mb-2" style={{ color: "var(--lp-text-primary)" }}>
                {f.title}
              </h3>
              <p className="font-body text-[0.9375rem] leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Google Drive card */}
        <div ref={driveRef}>
          <div
            className="rounded-2xl border p-7 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${driveFeature.accent}0c 0%, var(--lp-surface) 70%)`,
              borderColor: `${driveFeature.accent}30`,
            }}
          >
            <div
              className="pointer-events-none absolute -bottom-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-[0.12]"
              style={{ background: driveFeature.accent }}
            />
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${driveFeature.accent}18` }}
            >
              <HugeiconsIcon icon={driveFeature.icon} size={26} style={{ color: driveFeature.accent }} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-[1.05rem] mb-1.5" style={{ color: "var(--lp-text-primary)" }}>
                {driveFeature.title}
              </h3>
              <p className="font-body text-[0.9375rem] leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
                {driveFeature.body}
              </p>
            </div>
            <span
              className="shrink-0 text-[11px] font-body font-semibold px-2.5 py-1 rounded-full"
              style={{ background: `${driveFeature.accent}14`, color: driveFeature.accent }}
            >
              Google Drive
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
