"use client";

const logos = [
  "Notion", "Linear", "Stripe", "Vercel", "Figma", "GitHub", "Slack", "Loom",
];

export function LogoTicker() {
  const doubled = [...logos, ...logos];

  return (
    <section className="py-12 overflow-hidden" style={{ background: "var(--lp-bg-secondary)", borderTop: "1px solid var(--lp-border)", borderBottom: "1px solid var(--lp-border)" }}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 mb-6">
        <p className="text-center text-[11px] font-body font-medium uppercase tracking-widest" style={{ color: "var(--lp-text-muted)" }}>
          Trusted by teams at
        </p>
      </div>
      <div className="relative overflow-hidden">
        <div className="ticker-track">
          {doubled.map((name, i) => (
            <div
              key={i}
              className="flex items-center justify-center px-10 opacity-40 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
            >
              <span className="font-heading font-semibold text-[18px] whitespace-nowrap" style={{ color: "var(--lp-text-primary)" }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
