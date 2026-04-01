"use client";

import { Navbar }       from "./Navbar";
import { Hero }         from "./Hero";
import { LogoTicker }   from "./LogoTicker";
import { StatsBar }     from "./StatsBar";
import { HowItWorks }  from "./HowItWorks";
import { Features }     from "./Features";
import { Testimonials } from "./Testimonials";
import { FAQ }          from "./FAQ";
import { FinalCTA }     from "./FinalCTA";
import { Footer }       from "./Footer";
import { useEffect }    from "react";

export function LandingPage() {
  // Default to dark theme on first visit
  useEffect(() => {
    if (!localStorage.getItem("lp-theme")) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  return (
    <div style={{ background: "var(--lp-bg-primary)" }}>
      <div className="scroll-progress-bar" />
      <Navbar />
      <Hero />
      <LogoTicker />
      <StatsBar />
      <HowItWorks />
      <Features />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
