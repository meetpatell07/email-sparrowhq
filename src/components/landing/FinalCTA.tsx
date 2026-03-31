"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

gsap.registerPlugin(ScrollTrigger);

export function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
      });
      tl.fromTo(bgRef.current, { scale: 0.8 }, { scale: 1, duration: 1.0, ease: "expo.out" })
        .fromTo(contentRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "expo.out" }, "-=0.6");
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 md:py-40 overflow-hidden" style={{ background: "var(--lp-bg-tertiary)" }}>
      {/* Animated background */}
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,102,241,0.15), transparent)" }}
      />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 40% 40% at 50% 50%, rgba(168,85,247,0.08), transparent)" }} />

      <div ref={contentRef} className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 text-center">
        <p className="text-[12px] font-body font-medium uppercase tracking-widest mb-6" style={{ color: "var(--lp-text-muted)" }}>
          Get started today
        </p>
        <h2
          className="font-heading font-black tracking-tight mb-6"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "var(--lp-text-primary)", lineHeight: 0.95 }}
        >
          Your inbox won't<br />
          manage <em className="not-italic" style={{ color: "#6366f1" }}>itself.</em>
        </h2>
        <p className="font-body text-[1.05rem] max-w-md mx-auto mb-10" style={{ color: "var(--lp-text-secondary)" }}>
          Connect Gmail in 60 seconds. Let AI handle the rest.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.a
            href="/login"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-body font-medium text-[15px] shadow-md"
            style={{ background: "var(--lp-accent)", color: "var(--lp-accent-fg)" }}
          >
            Connect your Gmail
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </motion.a>
          <motion.a
            href="#features"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2 rounded-full border px-8 py-3.5 font-body font-medium text-[15px]"
            style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-primary)" }}
          >
            See all features
          </motion.a>
        </div>
        <p className="mt-5 text-[13px] font-body" style={{ color: "var(--lp-text-muted)" }}>
          Free to start · No credit card required · Works with any Gmail account
        </p>
      </div>
    </section>
  );
}
