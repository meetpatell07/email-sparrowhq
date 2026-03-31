"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Does SparrowHQ store my emails?",
    a: "No. SparrowHQ fetches email metadata (subject, sender, snippet) directly from Gmail in real-time. Full email bodies are only read during AI classification and are never stored permanently in our database.",
  },
  {
    q: "Which AI models power the classification and drafting?",
    a: "By default, SparrowHQ uses a local Ollama model for full privacy. You can optionally configure Groq or OpenRouter for faster, cloud-based inference — all configurable in Settings.",
  },
  {
    q: "Will the AI actually send emails without my approval?",
    a: "Never. All AI-generated drafts are saved to your Gmail Drafts folder and queued in the Drafts review panel. You explicitly approve or discard each one before anything is sent.",
  },
  {
    q: "What Google permissions does SparrowHQ need?",
    a: "SparrowHQ requests read access to Gmail (to fetch and classify emails), compose access (to save drafts), and read/write access to Google Calendar (to check availability and create events).",
  },
  {
    q: "Is there a free tier?",
    a: "Yes — the full product is free to start. Connect your Google account and get all features with local AI (Ollama). Cloud AI providers require your own API keys.",
  },
  {
    q: "Can I use SparrowHQ with multiple Google accounts?",
    a: "Multi-account support is on the roadmap. Currently one Google account per SparrowHQ login is supported.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="max-w-2xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <p className="text-[12px] font-body font-medium uppercase tracking-widest mb-4" style={{ color: "var(--lp-text-muted)" }}>
            FAQ
          </p>
          <h2
            className="font-heading font-bold tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", color: "var(--lp-text-primary)", lineHeight: 1.1 }}
          >
            Common <em className="not-italic" style={{ color: "#6366f1" }}>questions</em>
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border px-5"
              style={{ borderColor: "var(--lp-border)", background: "var(--lp-surface)" }}
            >
              <AccordionTrigger
                className="font-heading font-semibold text-[1rem] py-5 text-left hover:no-underline"
                style={{ color: "var(--lp-text-primary)" }}
              >
                {faq.q}
              </AccordionTrigger>
              <AccordionContent
                className="font-body text-[0.9375rem] leading-relaxed pb-5"
                style={{ color: "var(--lp-text-secondary)" }}
              >
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}
