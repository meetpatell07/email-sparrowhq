"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 5000, suffix: "+",  label: "Emails classified",        prefix: "" },
  { value: 2,    suffix: "h",  label: "Saved per week, per user", prefix: "~" },
  { value: 98,   suffix: "%",  label: "Classification accuracy",  prefix: "" },
  { value: 500,  suffix: "+",  label: "AI drafts generated",      prefix: "" },
];

export function StatsBar() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const numRefs    = useRef<(HTMLSpanElement | null)[]>([]);
  const itemRefs   = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Each stat item slides up individually — triggers independently,
      // reverses as you scroll back up past it.
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              end: "top 12%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });

      // Count-up — reverses (counts back down) when scrolling up
      stats.forEach((stat, i) => {
        const el = numRefs.current[i];
        if (!el) return;
        const obj = { value: 0 };
        gsap.fromTo(
          obj,
          { value: 0 },
          {
            value: stat.value,
            duration: 1.8,
            ease: "power3.out",
            snap: { value: 1 },
            scrollTrigger: {
              trigger: itemRefs.current[i],
              start: "top 88%",
              end: "top 12%",
              toggleActions: "play reverse play reverse",
            },
            onUpdate() {
              el.textContent = Math.round(obj.value).toLocaleString();
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="py-16 md:py-20 relative overflow-hidden"
      style={{ background: "var(--lp-bg-secondary)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ background: "radial-gradient(ellipse 50% 80% at 50% 0%, #6366f1, transparent)" }}
      />

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              ref={(el) => { itemRefs.current[i] = el; }}
              className="flex flex-col items-center text-center px-4 md:px-6"
              style={{
                borderRight: i < stats.length - 1 ? "1px solid var(--lp-border-subtle)" : "none",
              }}
            >
              <div
                className="font-heading font-black leading-none mb-2 tabular-nums"
                style={{
                  fontSize: "clamp(2.25rem, 4vw, 3rem)",
                  color: "var(--lp-text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                <span style={{ color: "var(--lp-text-muted)", fontSize: "0.6em" }}>{stat.prefix}</span>
                <span ref={(el) => { numRefs.current[i] = el; }}>0</span>
                <span>{stat.suffix}</span>
              </div>
              <p className="text-[13px] font-body max-w-[120px] leading-snug" style={{ color: "var(--lp-text-muted)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
