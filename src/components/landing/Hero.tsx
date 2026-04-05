"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

const HeroScene = dynamic(() => import("./HeroScene").then((m) => m.HeroScene), { ssr: false });

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(badgeRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
        .fromTo(headlineRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0 }, "-=0.5")
        .fromTo(subRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.7")
        .fromTo(ctaRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.6");
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden pt-16"
      style={{ background: "var(--lp-bg-primary)" }}
    >

      {/* 3D canvas — desktop only */}


      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-screen-xl mx-auto">
        {/* Announcement badge */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-body mb-8"
          style={{ borderColor: "var(--lp-border)", background: "var(--lp-surface)", color: "var(--lp-text-secondary)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          New · AI Draft replies now in beta
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="font-heading font-black tracking-tight leading-[0.95] mb-6"
          style={{
            fontSize: "clamp(3rem, 7vw, 6.5rem)",
            color: "var(--lp-text-primary)",
          }}
        >
          Your inbox,{" "}
          <em className="not-italic" style={{ color: "#6366f1" }}>intelligently</em>
          <br />
          managed.
        </h1>

        {/* Subtext */}
        <p
          ref={subRef}
          className="font-body text-[1.125rem] leading-relaxed max-w-xl mb-10"
          style={{ color: "var(--lp-text-secondary)" }}
        >
          SparrowHQ connects to Gmail, classifies every email with AI, auto-drafts
          replies for urgent threads, and lets you command your inbox in plain English.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-3">
          <motion.a
            href="/login"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 font-body font-medium text-[15px] shadow-sm"
            style={{ background: "var(--lp-accent)", color: "var(--lp-accent-fg)" }}
          >
            Get started free
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </motion.a>

          <motion.a
            href="#features"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2 rounded-full border px-7 py-3 font-body font-medium text-[15px] transition-colors"
            style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-primary)", background: "transparent" }}
          >
            See how it works
          </motion.a>
        </div>

        <p className="mt-5 text-[13px] font-body" style={{ color: "var(--lp-text-muted)" }}>
          Free to start · No credit card required
        </p>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce">
        <div className="w-px h-8 rounded-full" style={{ background: "var(--lp-border)" }} />
      </div>
    </section>
  );
}
