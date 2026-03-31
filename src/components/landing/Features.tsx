"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SparklesIcon,
  Mail01Icon,
  Invoice01Icon,
  Calendar01Icon,
  BubbleChatIcon,
  CheckmarkSquare01Icon,
} from "@hugeicons/core-free-icons";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: SparklesIcon,
    title: "Smart Classification",
    body: "Every email is instantly labeled — Personal, Client, Urgent, Invoice, Marketing, or Notification — the moment it hits your inbox.",
    accent: "#6366f1",
  },
  {
    icon: Mail01Icon,
    title: "Auto-Draft Replies",
    body: "AI writes context-aware draft replies for urgent and client emails, saved directly to your Gmail Drafts. You approve, it sends.",
    accent: "#0284C7",
  },
  {
    icon: Invoice01Icon,
    title: "Invoice Extraction",
    body: "Never manually log a bill again. SparrowHQ detects invoice emails and pulls out vendor, amount, and due date automatically.",
    accent: "#059669",
  },
  {
    icon: Calendar01Icon,
    title: "Calendar-Aware Drafts",
    body: "Before drafting a reply, the AI checks your calendar. It includes your free slots so scheduling suggestions are always accurate.",
    accent: "#D97706",
  },
  {
    icon: BubbleChatIcon,
    title: "Natural Language Commands",
    body: "Tell the AI what you need in plain English. Ask about your schedule, draft a reply, or create a meeting — all from the chat panel.",
    accent: "#7C3AED",
  },
  {
    icon: CheckmarkSquare01Icon,
    title: "One-Click Draft Review",
    body: "All AI-generated drafts queue up in a single view. Approve to send, discard to delete, or open in Gmail to edit before sending.",
    accent: "#EA580C",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current?.children ?? [],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: cardsRef.current, start: "top 75%", once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-24 md:py-32">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[12px] font-body font-medium uppercase tracking-widest mb-4" style={{ color: "var(--lp-text-muted)" }}>
            Features
          </p>
          <h2
            className="font-heading font-bold tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", color: "var(--lp-text-primary)", lineHeight: 1.1 }}
          >
            Everything your inbox <em className="not-italic" style={{ color: "#6366f1" }}>deserves</em>
          </h2>
          <p className="mt-4 text-[1.05rem] font-body max-w-xl mx-auto" style={{ color: "var(--lp-text-secondary)" }}>
            Built around the three things that actually matter: saving time, never missing something urgent, and getting replies out fast.
          </p>
        </div>

        {/* Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <motion.div
              key={f.title}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="rounded-2xl border p-8 cursor-default"
              style={{
                background: "var(--lp-surface)",
                borderColor: "var(--lp-border)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${f.accent}18` }}
              >
                <HugeiconsIcon icon={f.icon} size={24} style={{ color: f.accent }} strokeWidth={1.5} />
              </div>
              <h3 className="font-heading font-semibold text-[1.15rem] mb-2" style={{ color: "var(--lp-text-primary)" }}>
                {f.title}
              </h3>
              <p className="font-body text-[0.9375rem] leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
