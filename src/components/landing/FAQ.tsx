"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    q: "Does SparrowHQ store my emails?",
    a: "No. SparrowHQ reads email metadata and body in-memory for AI classification and drafting, but never stores the content in our database. Only operational metadata (Gmail message ID, received timestamp, category) is persisted.",
  },
  {
    q: "Which AI model powers classification and drafting?",
    a: "By default, SparrowHQ uses a local Ollama model for full privacy. You can optionally configure Groq or OpenRouter for faster, cloud-based inference — all configurable in Settings with your own API keys.",
  },
  {
    q: "Will the AI ever send emails without my approval?",
    a: "Never. Every AI-generated draft is saved to your Gmail Drafts folder and queued in the Drafts review panel. You explicitly approve or discard each one — nothing is sent automatically.",
  },
  {
    q: "What Google permissions does SparrowHQ need?",
    a: "Gmail read + compose access (to fetch, classify, and save drafts), Google Calendar read/write (to check availability and create events), and Google Drive read (for the Drive browser and Vault backup). All scopes are shown during OAuth.",
  },
  {
    q: "What is the Vault?",
    a: "The Vault automatically captures every email attachment and backs it up to your Google Drive. You can browse, search, download, or re-use files — even if the original email is deleted.",
  },
  {
    q: "How does the Chrome Extension work?",
    a: "Install the extension, open any webpage (job listing, pricing page, LinkedIn profile), type a recipient and a short intent, and SparrowHQ generates a structured, context-aware draft from the page content — saved directly to Gmail Drafts.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes — the full product is free to start. Connect your Google account and access all features with a local Ollama model. Cloud AI providers require your own API key (Groq, OpenRouter).",
  },
  {
    q: "Can I use SparrowHQ with multiple Google accounts?",
    a: "Multi-account support is on the roadmap. Currently one Google account per SparrowHQ login is supported.",
  },
];

export function FAQ() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const itemRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Heading wipe ───────────────────────────────────────────────────────
      gsap.fromTo(
        headingRef.current,
        { clipPath: "inset(0 0 100% 0)", y: 14 },
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

      // ── Vertical accent line draws down, un-draws on scroll up ────────────
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          duration: 1.0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            end: "top 5%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // ── Each FAQ item slides in from the right — reverses on scroll up ────
      itemRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, x: 22 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 10%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: "var(--lp-bg-secondary)" }}
    >
      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "linear-gradient(var(--lp-border) 1px, transparent 1px), linear-gradient(90deg, var(--lp-border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-2xl mx-auto px-4 md:px-8 relative">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[12px] font-body font-medium uppercase tracking-widest mb-4" style={{ color: "var(--lp-text-muted)" }}>
            FAQ
          </p>
          <h2
            ref={headingRef}
            className="font-heading font-bold tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", color: "var(--lp-text-primary)", lineHeight: 1.1 }}
          >
            Common <em className="not-italic" style={{ color: "#6366f1" }}>questions</em>
          </h2>
        </div>

        {/* Accordion with left accent line */}
        <div className="relative">
          <div
            ref={lineRef}
            className="hidden md:block absolute -left-8 top-0 bottom-0 w-[1px]"
            style={{ background: "linear-gradient(to bottom, #6366f1, #7C3AED, transparent)" }}
          />

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                ref={(el) => { itemRefs.current[i] = el; }}
              >
                <AccordionItem
                  value={`item-${i}`}
                  className="rounded-xl border px-5"
                  style={{ borderColor: "var(--lp-border)", background: "var(--lp-surface)" }}
                >
                  <AccordionTrigger
                    className="font-heading font-semibold text-[1rem] py-5 text-left hover:no-underline"
                    style={{ color: "var(--lp-text-primary)" }}
                  >
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent
                    className="font-body text-[0.9375rem] leading-relaxed pb-5"
                    style={{ color: "var(--lp-text-secondary)" }}
                  >
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </section>
  );
}
