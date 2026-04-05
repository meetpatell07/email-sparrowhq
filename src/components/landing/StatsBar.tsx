"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 1000, suffix: "+", label: "Emails classified" },
  { value: 2, suffix: "h", label: "Saved per week, per user" },
  { value: 98, suffix: "%", label: "Classification accuracy" },
  { value: 100, suffix: "+", label: "AI drafts generated" },
];

export function StatsBar() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
            ease: "power2.out",
            snap: { value: 1 },
            delay: i * 0.12,
            scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
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
    <section id="stats" ref={sectionRef} className="py-16 md:py-20" style={{ background: "var(--lp-bg-secondary)" }}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center px-6"
              style={{ borderRight: i < stats.length - 1 ? "1px solid var(--lp-border-subtle)" : "none" }}
            >
              <div className="font-heading font-black text-[3rem] leading-none mb-2 tabular-nums" style={{ color: "var(--lp-text-primary)" }}>
                <span ref={(el) => { numRefs.current[i] = el; }}>0</span>
                <span>{stat.suffix}</span>
              </div>
              <p className="text-[13px] font-body" style={{ color: "var(--lp-text-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
