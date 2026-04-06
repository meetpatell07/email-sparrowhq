"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

gsap.registerPlugin(ScrollTrigger);

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  x: ((i * 137.508) % 100),
  y: ((i * 97.3)    % 100),
  size: 1.5 + (i % 3) * 0.8,
  delay: (i * 0.18) % 3,
  duration: 2.8 + (i % 4) * 0.6,
}));

export function FinalCTA() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const bgRef       = useRef<HTMLDivElement>(null);
  const orbRef      = useRef<HTMLDivElement>(null);
  const headingRef  = useRef<HTMLHeadingElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const badgesRef   = useRef<HTMLDivElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Background — scrub is naturally bidirectional ─────────────────────
      gsap.fromTo(
        bgRef.current,
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 1.2,
          },
        }
      );

      // Orb — slow parallax
      gsap.to(orbRef.current, {
        scale: 1.2,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2.5,
        },
      });

      // ── Heading wipe ──────────────────────────────────────────────────────
      gsap.fromTo(
        headingRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 1.0,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 82%",
            end: "top 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // ── Subtext, CTAs, badges — staggered slides up ───────────────────────
      [subRef.current, ctaRef.current, badgesRef.current].forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            delay: i * 0.06,
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 78%",
              end: "top 10%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });

      // ── Floating particles — infinite loop, unrelated to scroll ──────────
      if (particleRef.current) {
        Array.from(particleRef.current.children).forEach((dot, i) => {
          gsap.to(dot, {
            y: -14 - (i % 4) * 6,
            opacity: 0.12 + (i % 3) * 0.08,
            duration: PARTICLES[i].duration,
            delay: PARTICLES[i].delay,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-36 md:py-48 overflow-hidden"
      style={{ background: "var(--lp-bg-tertiary)" }}
    >
      {/* Radial bg — scales in on scroll */}
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none opacity-0"
        style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(99,102,241,0.13), transparent)" }}
      />

      {/* Orb */}
      <div
        ref={orbRef}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full blur-[100px] opacity-20"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.45), rgba(99,102,241,0.25), transparent 70%)" }}
      />

      {/* Particles */}
      <div ref={particleRef} className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-0"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: i % 3 === 0 ? "#6366f1" : i % 3 === 1 ? "#a855f7" : "#38bdf8",
            }}
          />
        ))}
      </div>

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--lp-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--lp-text-primary) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 text-center">
        <p className="text-[12px] font-body font-medium uppercase tracking-widest mb-6" style={{ color: "var(--lp-text-muted)" }}>
          Get started today
        </p>

        <h2
          ref={headingRef}
          className="font-heading font-black tracking-tight mb-6"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "var(--lp-text-primary)", lineHeight: 0.95 }}
        >
          Your inbox won&apos;t<br />
          manage <em className="not-italic" style={{ color: "#6366f1" }}>itself.</em>
        </h2>

        <p
          ref={subRef}
          className="font-body text-[1.05rem] max-w-md mx-auto mb-10"
          style={{ color: "var(--lp-text-secondary)" }}
        >
          Connect Gmail in 60 seconds. AI classification, auto-drafts, Vault, and the Chrome Extension — all included.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.a
            href="/login"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-body font-semibold text-[15px] shadow-md"
            style={{ background: "var(--lp-accent)", color: "var(--lp-accent-fg)" }}
          >
            Connect your Gmail
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </motion.a>
          <motion.a
            href="#features"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2 rounded-full border px-8 py-3.5 font-body font-medium text-[15px]"
            style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-primary)" }}
          >
            See all features
          </motion.a>
        </div>

        <p className="mt-6 text-[13px] font-body" style={{ color: "var(--lp-text-muted)" }}>
          Free to start · No credit card required · Works with any Gmail account
        </p>

        <div ref={badgesRef} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            "Privacy-first — email content never stored",
            "Google-verified OAuth",
            "Local AI option (Ollama)",
          ].map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 font-body text-[12px] px-3.5 py-1.5 rounded-full border"
              style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-muted)", background: "var(--lp-surface)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0" />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
