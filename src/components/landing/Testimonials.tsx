"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
    quote: "Switched from a competitor's tool. The natural language chat is night-and-day — it actually does what you ask instead of returning generic suggestions.",
    name: "Lena B.",
    title: "Product Manager, Arc",
  },
  {
    quote: "The follow-up detection saved me three client relationships I would have let slip through. It just knows when something needs my attention.",
    name: "Marcus W.",
    title: "Account Executive, Pillar",
  },
  {
    quote: "Setting it up took less than 5 minutes. By the end of my first day it had already drafted 8 replies I would have procrastinated on.",
    name: "Anya S.",
    title: "Head of Ops, Beacon",
  },
];

// Duplicate for seamless infinite loop
const row1 = [...testimonials, ...testimonials];
const row2 = [...testimonials, ...testimonials].reverse();

function TestimonialCard({ quote, name, title }: { quote: string; name: string; title: string }) {
  return (
    <div
      className="flex-shrink-0 w-[340px] rounded-2xl border p-6"
      style={{ background: "var(--lp-surface-raised)", borderColor: "var(--lp-border)" }}
    >
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <HugeiconsIcon key={i} icon={StarIcon} size={14} style={{ color: "#F59E0B" }} />
        ))}
      </div>
      <p
        className="font-body text-[0.9375rem] leading-relaxed mb-5 border-l-2 pl-3"
        style={{ color: "var(--lp-text-primary)", borderColor: "#6366f1" }}
      >
        {quote}
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-[14px] flex-shrink-0"
          style={{ background: "var(--lp-bg-tertiary)", color: "var(--lp-text-primary)" }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-body font-medium text-[14px]" style={{ color: "var(--lp-text-primary)" }}>{name}</p>
          <p className="font-body text-[12px]" style={{ color: "var(--lp-text-muted)" }}>{title}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const headingRef  = useRef<HTMLHeadingElement>(null);
  const labelRef    = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        labelRef.current,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: labelRef.current,
            start: "top 87%",
            end: "top 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
      gsap.fromTo(
        headingRef.current,
        { clipPath: "inset(0 0 100% 0)", y: 14 },
        {
          clipPath: "inset(0 0 0% 0)",
          y: 0,
          duration: 0.85,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            end: "top 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="testimonials" className="py-24 md:py-32" style={{ background: "var(--lp-bg-secondary)" }}>
      <style>{`
        @keyframes marquee-ltr {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @keyframes marquee-rtl {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track-ltr {
          animation: marquee-ltr 40s linear infinite;
        }
        .marquee-track-rtl {
          animation: marquee-rtl 40s linear infinite;
        }
        .marquee-outer:hover .marquee-track-ltr,
        .marquee-outer:hover .marquee-track-rtl {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 mb-16 text-center">
        <p
          ref={labelRef}
          className="text-[12px] font-body font-medium uppercase tracking-widest mb-4"
          style={{ color: "var(--lp-text-muted)" }}
        >
          Testimonials
        </p>
        <h2
          ref={headingRef}
          className="font-heading font-bold tracking-tight"
          style={{
            fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
            color: "var(--lp-text-primary)",
            lineHeight: 1.1,
          }}
        >
          What people are <em className="not-italic" style={{ color: "#6366f1" }}>saying</em>
        </h2>
      </div>

      {/* Marquee wrapper — hover pauses both rows */}
      <div
        className="marquee-outer overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        {/* Row 1 — left to right */}
        <div className="flex gap-4 mb-4" style={{ width: "max-content" }}>
          <div className="marquee-track-ltr flex gap-4" style={{ width: "max-content" }}>
            {row1.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </div>

        {/* Row 2 — right to left */}
        <div className="flex gap-4" style={{ width: "max-content" }}>
          <div className="marquee-track-rtl flex gap-4" style={{ width: "max-content" }}>
            {row2.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
