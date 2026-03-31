"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, NewTwitterIcon, LinkedinIcon } from "@hugeicons/core-free-icons";
import { SparrowMark } from "./Logo";

const links = {
  Product:  ["Features", "How it works", "Changelog", "Roadmap"],
  Resources: ["Documentation", "GitHub", "Status", "Support"],
  Legal:    ["Privacy Policy", "Terms of Service", "Security"],
};

export function Footer() {
  return (
    <footer className="border-t" style={{ background: "var(--lp-bg-primary)", borderColor: "var(--lp-border)" }}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <SparrowMark size={26} color="var(--lp-text-primary)" />
              <span className="font-heading font-bold text-[15px]" style={{ color: "var(--lp-text-primary)" }}>SparrowHQ</span>
            </div>
            <p className="font-body text-[13px] leading-relaxed max-w-[200px]" style={{ color: "var(--lp-text-muted)" }}>
              AI-powered email management for busy people.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="font-body font-medium text-[12px] uppercase tracking-widest mb-4" style={{ color: "var(--lp-text-muted)" }}>
                {group}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="font-body text-[14px] transition-opacity hover:opacity-100" style={{ color: "var(--lp-text-secondary)", opacity: 0.8 }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t" style={{ borderColor: "var(--lp-border-subtle)" }}>
          <p className="font-body text-[13px]" style={{ color: "var(--lp-text-muted)" }}>
            © {new Date().getFullYear()} SparrowHQ. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[GithubIcon, NewTwitterIcon, LinkedinIcon].map((Icon, i) => (
              <a key={i} href="#" className="transition-opacity hover:opacity-100" style={{ color: "var(--lp-text-muted)", opacity: 0.6 }}>
                <HugeiconsIcon icon={Icon} size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
