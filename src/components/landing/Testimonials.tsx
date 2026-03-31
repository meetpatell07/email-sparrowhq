"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "I used to spend 45 minutes every morning triaging my inbox. Now I open SparrowHQ, review the AI's draft replies, hit approve, and I'm done in 10.",
    name: "Sarah K.",
    title: "Founder, Meridian Studio",
  },
  {
    quote: "The invoice extraction alone is worth it. I was manually copying vendor details into a spreadsheet every week. That's completely gone now.",
    name: "James T.",
    title: "Operations Lead, Fieldwork",
  },
  {
    quote: "The calendar-aware drafts are genuinely impressive. It proposed three available slots in my reply without me asking. My clients love the quick turnaround.",
    name: "Priya M.",
    title: "Consultant, independent",
  },
  {
    quote: "As a solo founder wearing every hat, having an AI that actually understands urgency and prioritises accordingly is a game changer.",
    name: "Daniel R.",
    title: "CEO, Vaulted",
  },
  {
    quote: "Switched from a competitors tool. The natural language chat is night-and-day — it actually does what you ask instead of returning generic suggestions.",
    name: "Lena B.",
    title: "Product Manager, Arc",
  },
];

export function Testimonials() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 0.9,
          ease: "power3.inOut",
          scrollTrigger: { trigger: headingRef.current, start: "top 80%", once: true },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="testimonials" className="py-24 md:py-32" style={{ background: "var(--lp-bg-secondary)" }}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <p className="text-[12px] font-body font-medium uppercase tracking-widest mb-4" style={{ color: "var(--lp-text-muted)" }}>
            Testimonials
          </p>
          <h2
            ref={headingRef}
            className="font-heading font-bold tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", color: "var(--lp-text-primary)", lineHeight: 1.1 }}
          >
            What people are <em className="not-italic" style={{ color: "#6366f1" }}>saying</em>
          </h2>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="animate-on-scroll break-inside-avoid rounded-2xl border p-6 mb-4"
              style={{ background: "var(--lp-surface-raised)", borderColor: "var(--lp-border)" }}
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <HugeiconsIcon key={si} icon={StarIcon} size={14} style={{ color: "#F59E0B" }} />
                ))}
              </div>
              <p className="font-body text-[0.9375rem] leading-relaxed mb-5 border-l-2 pl-3"
                style={{ color: "var(--lp-text-primary)", borderColor: "#6366f1" }}>
                {t.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-[14px]"
                  style={{ background: "var(--lp-bg-tertiary)", color: "var(--lp-text-primary)" }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-body font-medium text-[14px]" style={{ color: "var(--lp-text-primary)" }}>{t.name}</p>
                  <p className="font-body text-[12px]" style={{ color: "var(--lp-text-muted)" }}>{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
