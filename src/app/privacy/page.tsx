import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — EmailHQ",
  description: "How EmailHQ collects, uses, and protects your data.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      {
        heading: "Account Information",
        body: "When you sign in with Google, we receive your name, email address, and profile picture from your Google account. We do not store your Google password.",
      },
      {
        heading: "Email Data",
        body: "With your explicit permission, EmailHQ reads your Gmail messages to classify them into categories (Urgent, Client, Invoice, Personal, Marketing, Notification) and to generate draft replies. We access only the data necessary to provide these features. We do not sell or share your email content with third parties.",
      },
      {
        heading: "Calendar Data",
        body: "If you grant calendar access, EmailHQ reads your upcoming events to provide availability context when drafting replies. We do not modify your calendar events.",
      },
      {
        heading: "Google Drive Data",
        body: "If you use the file-based draft feature, EmailHQ reads the content of specific files you select. We do not access files you have not explicitly chosen.",
      },
      {
        heading: "Usage Data",
        body: "We collect anonymous usage statistics (e.g. feature interactions, error logs) to improve the product. This data cannot be linked back to your identity.",
      },
    ],
  },
  {
    title: "2. How We Use Your Data",
    content: [
      {
        heading: "AI Classification & Drafting",
        body: "Email content is sent to the Groq API solely for the purpose of classifying emails and generating draft replies on your behalf. This processing happens in real time; we do not permanently store the raw content of your emails on our servers.",
      },
      {
        heading: "Gmail Label Sync",
        body: "We apply labels to your Gmail messages reflecting the AI-assigned category. These labels are written back to your Gmail account using the Gmail API.",
      },
      {
        heading: "Service Improvement",
        body: "Aggregated, anonymised data may be used to improve classification accuracy and feature development. Individual email content is never used for model training.",
      },
    ],
  },
  {
    title: "3. Data Storage & Security",
    content: [
      {
        heading: "OAuth Tokens",
        body: "Your Google OAuth refresh token is encrypted with AES-256-CBC before being stored in our database. Access tokens are short-lived and rotated automatically by Google.",
      },
      {
        heading: "Database",
        body: "We use a hosted PostgreSQL database (Neon) with encryption at rest. Access is restricted to authenticated application services only.",
      },
      {
        heading: "Transmission",
        body: "All data in transit is encrypted using TLS 1.2 or higher. We enforce HTTPS across all endpoints.",
      },
      {
        heading: "Data Retention",
        body: "Email metadata (sender, subject, category) is retained to power your inbox view. Raw email body content is not persisted beyond the immediate processing request. You can request full account deletion at any time.",
      },
    ],
  },
  {
    title: "4. Third-Party Services",
    content: [
      {
        heading: "Google APIs",
        body: "EmailHQ's use of Google APIs (Gmail, Calendar, Drive) is subject to Google's Privacy Policy and Terms of Service. Our use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
      },
      {
        heading: "Groq",
        body: "Email content is processed by the Groq API to perform classification and draft generation. Groq's data processing terms apply to this processing.",
      },
      {
        heading: "Hosting & Infrastructure",
        body: "EmailHQ is hosted on Cloudflare Pages. Infrastructure providers may process data in the course of providing their services, subject to their respective privacy policies.",
      },
    ],
  },
  {
    title: "5. Your Rights",
    content: [
      {
        heading: "Access & Portability",
        body: "You may request a copy of the personal data we hold about you at any time by contacting us at privacy@emailhq.app.",
      },
      {
        heading: "Deletion",
        body: "You may request deletion of your account and all associated data. Upon request, we will delete your account, encrypted tokens, and email metadata within 30 days.",
      },
      {
        heading: "Revoking Access",
        body: "You can revoke EmailHQ's access to your Google account at any time via your Google Account Security settings (myaccount.google.com/permissions). Revoking access will disable EmailHQ functionality but will not automatically delete stored data.",
      },
      {
        heading: "GDPR & CCPA",
        body: "If you are located in the European Economic Area or California, you have additional rights under GDPR and CCPA respectively, including the right to object to processing and the right to know what personal data is sold (we do not sell personal data).",
      },
    ],
  },
  {
    title: "6. Cookies",
    content: [
      {
        heading: "Session Cookies",
        body: "We use strictly necessary session cookies to keep you logged in. We do not use third-party tracking cookies or advertising cookies.",
      },
    ],
  },
  {
    title: "7. Changes to This Policy",
    content: [
      {
        heading: "",
        body: "We may update this Privacy Policy from time to time. We will notify you of material changes by posting a notice on the app or by email. Continued use of EmailHQ after changes are posted constitutes acceptance of the revised policy.",
      },
    ],
  },
  {
    title: "8. Contact",
    content: [
      {
        heading: "",
        body: "Questions about this policy? Reach us at privacy@emailhq.app or by mail at EmailHQ, 1 Canada Square, London, E14 5AB, United Kingdom.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen font-body"
      style={{ background: "var(--lp-bg-primary)", color: "var(--lp-text-primary)" }}
    >
      {/* Nav bar back link */}
      <div
        className="border-b"
        style={{ borderColor: "var(--lp-border)", background: "var(--lp-surface)" }}
      >
        <div className="max-w-screen-md mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-heading font-bold text-[16px]"
            style={{ color: "var(--lp-text-primary)" }}
          >
            EmailHQ
          </Link>
          <Link
            href="/"
            className="text-[13px] font-body transition-opacity hover:opacity-70"
            style={{ color: "var(--lp-text-muted)" }}
          >
            ← Back to home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-md mx-auto px-4 md:px-8 py-16 md:py-24">
        <p
          className="text-[11px] font-semibold uppercase tracking-widest mb-4"
          style={{ color: "var(--lp-text-muted)" }}
        >
          Legal
        </p>
        <h1
          className="font-heading font-bold mb-3"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.1, color: "var(--lp-text-primary)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-[14px] mb-12" style={{ color: "var(--lp-text-muted)" }}>
          Last updated: 1 April 2026
        </p>

        <p
          className="text-[15px] leading-relaxed mb-12 pb-12 border-b"
          style={{ color: "var(--lp-text-secondary)", borderColor: "var(--lp-border)" }}
        >
          EmailHQ ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>") is committed to protecting your
          privacy. This policy explains what information we collect when you use EmailHQ, how we use it,
          and the choices you have. By using EmailHQ you agree to the practices described here.
        </p>

        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h2
                className="font-heading font-bold text-[1.25rem] mb-6"
                style={{ color: "var(--lp-text-primary)" }}
              >
                {section.title}
              </h2>
              <div className="space-y-5">
                {section.content.map((item, i) => (
                  <div key={i}>
                    {item.heading && (
                      <p
                        className="font-body font-semibold text-[14px] mb-1"
                        style={{ color: "var(--lp-text-primary)" }}
                      >
                        {item.heading}
                      </p>
                    )}
                    <p
                      className="text-[14px] leading-relaxed"
                      style={{ color: "var(--lp-text-secondary)" }}
                    >
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div
          className="mt-16 pt-8 border-t flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{ borderColor: "var(--lp-border)" }}
        >
          <p className="text-[13px]" style={{ color: "var(--lp-text-muted)" }}>
            © {new Date().getFullYear()} EmailHQ. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-[13px] transition-opacity hover:opacity-70" style={{ color: "var(--lp-text-muted)" }}>
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-[13px] transition-opacity hover:opacity-70" style={{ color: "var(--lp-accent)" }}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
