import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Roadmap — EmailHQ",
    description: "How EmailHQ was built, what shipped, and where we're going.",
};

type Status = "shipped" | "building" | "planned";

interface RoadmapEntry {
    version: string;
    date: string;
    status: Status;
    title: string;
    description: string;
    items: string[];
}

const STATUS_CONFIG: Record<Status, { label: string; dot: string; badge: string; text: string }> = {
    shipped:  { label: "Shipped",   dot: "#22c55e", badge: "bg-[#14532d22]", text: "text-[#22c55e]" },
    building: { label: "Building",  dot: "#f59e0b", badge: "bg-[#78350f22]", text: "text-[#f59e0b]" },
    planned:  { label: "Planned",   dot: "#6b7280", badge: "bg-[#1f293722]", text: "text-[#6b7280]" },
};

const entries: RoadmapEntry[] = [
    {
        version: "v0.1",
        date: "Nov 2024",
        status: "shipped",
        title: "The first spark",
        description: "Proof of concept. One API route, one model call, five emails printed to a console. Ugly, but it classified emails correctly.",
        items: [
            "Next.js 15 project scaffolded with App Router",
            "Google OAuth via Better Auth",
            "First call to local LLM (Ollama + llama3.2) to classify an email",
            "Confirmed the core idea actually worked",
        ],
    },
    {
        version: "v0.2",
        date: "Dec 2024",
        status: "shipped",
        title: "Real-time Gmail pipeline",
        description: "Moved from polling to push. Emails now arrive within seconds of landing in your inbox.",
        items: [
            "Gmail Pub/Sub webhook integration",
            "Upstash QStash for reliable background job processing",
            "Redis dedup keys to prevent double-processing",
            "Gmail history.list delta processing — only new messages fetched",
            "DRAFT / SENT / SPAM label guards to stop infinite loops",
        ],
    },
    {
        version: "v0.3",
        date: "Dec 2024",
        status: "shipped",
        title: "AI classification engine",
        description: "The brain of EmailHQ. Every email is now understood, not just received.",
        items: [
            "7-category classification: Priority, Follow Up, Planned, Finance, Personal, Notification, Marketing",
            "Zod schema validation on AI output — bad model responses never crash the pipeline",
            "Gmail label sync — categories written back as real Gmail labels with colour coding",
            "Renamed 'Important' → 'Priority' and 'Scheduled' → 'Planned' to avoid Gmail system label conflicts (409 errors)",
            "Multi-label support: up to 2 labels per email (action + context)",
        ],
    },
    {
        version: "v0.4",
        date: "Jan 2025",
        status: "shipped",
        title: "Auto-draft generation",
        description: "EmailHQ doesn't just read your email — it starts writing the reply for you.",
        items: [
            "generateDraftReply() powered by local LLM",
            "Drafts saved to Gmail Drafts API with correct thread headers",
            "Thread deduplication guard — one draft per thread, no duplicates",
            "Draft approval flow: review in-app, send directly from Gmail draft via drafts.send()",
            "Draft status tracking: pending_approval → sent",
        ],
    },
    {
        version: "v0.5",
        date: "Jan 2025",
        status: "shipped",
        title: "Privacy-first architecture",
        description: "A deliberate, hard architectural decision: no email content ever touches the database.",
        items: [
            "Dropped subject, snippet, sender, recipient columns from the emails table",
            "Dropped draft content column from the drafts table",
            "Added fetchEmailMetadataById() — live Gmail fetch for display",
            "Added fetchGmailDraftContent() — live Gmail Drafts fetch for display",
            "Redis thin cache: 20 emails, 5-minute TTL, invalidated on ingest",
            "All AI processing happens in-memory and is immediately discarded",
        ],
    },
    {
        version: "v0.6",
        date: "Jan 2025",
        status: "shipped",
        title: "Vault & invoice extraction",
        description: "Finance emails get special treatment. Invoices are parsed and structured, attachments archived.",
        items: [
            "Cloudflare R2 attachment storage with presigned URL access",
            "AI-powered invoice extraction: vendor, amount, currency, due date",
            "Vault dashboard: list and detail view for all attachments",
            "Google Drive integration for file-based draft creation",
            "Draft from file: select a Drive doc, add instructions, get an email draft",
        ],
    },
    {
        version: "v0.7",
        date: "Feb 2025",
        status: "shipped",
        title: "Calendar-aware drafting",
        description: "The AI now knows your schedule. Drafts reference your actual availability — not generic placeholders.",
        items: [
            "Google Calendar integration with OAuth token refresh",
            "getCalendarContextForDraft() — shared context builder for all draft paths",
            "Smart category filter: only fetches calendar for relevant categories (scheduled, important, follow_up)",
            "4-second timeout guard — calendar API latency never blocks drafting",
            "Parallel fetch: Gmail metadata + calendar context fetched simultaneously",
            "7-day window for scheduling emails, today-only for reply emails",
        ],
    },
    {
        version: "v0.8",
        date: "Feb 2025",
        status: "shipped",
        title: "Dashboard & AI assistant",
        description: "A full dashboard UI with tabs, cards, and an AI chat panel that understands your inbox.",
        items: [
            "Overview dashboard: email cards, Drive files tab, Calendar tab with 7-day view",
            "Fixed calendar infinite-loading bug (unstable SWR key from new Date() on every render)",
            "AI assistant panel: draft emails, check calendar, list recent emails, create events",
            "Categories page with full label documentation",
            "Drive page with list/grid toggle",
            "Gmail label rename on categories page reflecting actual label names",
        ],
    },
    {
        version: "v1.0",
        date: "Mar 2025",
        status: "shipped",
        title: "Public launch & open source",
        description: "EmailHQ goes public. The full codebase is open sourced under MIT.",
        items: [
            "Landing page with dark/light theme, GSAP animations, 3D hero scene",
            "Privacy Policy and Terms of Service pages",
            "README rewritten to document the full architecture",
            "Open sourced on GitHub",
            "Production deployment on Vercel + Neon + Upstash",
        ],
    },
    {
        version: "v1.1",
        date: "Q2 2025",
        status: "building",
        title: "Smarter AI & better UX",
        description: "Improving the quality of AI output and the day-to-day experience of using the product.",
        items: [
            "Upgrade to a more capable model for better draft quality",
            "Multi-email thread context — AI reads the full thread before drafting",
            "Inline email reader so you never leave the dashboard",
            "Notification system for high-priority emails",
            "Keyboard shortcuts throughout the dashboard",
        ],
    },
    {
        version: "v1.2",
        date: "Q3 2025",
        status: "planned",
        title: "Team & collaboration",
        description: "EmailHQ for teams. Share inboxes, delegate drafts, collaborate on responses.",
        items: [
            "Workspace model: invite teammates, shared inbox view",
            "Draft assignment: route drafts to the right person",
            "Comment threads on drafts before sending",
            "Audit log: full history of what the AI touched",
            "Role-based access control",
        ],
    },
    {
        version: "v1.3",
        date: "Q4 2025",
        status: "planned",
        title: "Mobile app & integrations",
        description: "Your AI inbox wherever you are, connected to the tools you already use.",
        items: [
            "Native iOS and Android apps",
            "Slack integration: get notified about Priority emails in your channels",
            "Notion integration: auto-log action items from emails",
            "Zapier / Make connector for custom automations",
            "Outlook / Microsoft 365 support",
        ],
    },
];

export default function RoadmapPage() {
    const shipped = entries.filter((e) => e.status === "shipped").length;
    const total = entries.length;

    return (
        <div style={{ background: "var(--lp-bg-primary)" }}>
            <Navbar />

            <main className="pt-32 pb-24 px-4 md:px-8 max-w-3xl mx-auto">

                {/* Header */}
                <p className="font-body text-[12px] uppercase tracking-widest mb-4" style={{ color: "var(--lp-text-muted)" }}>
                    Product changelog
                </p>
                <h1 className="font-heading font-bold text-[38px] md:text-[52px] leading-[1.1] tracking-tight mb-4" style={{ color: "var(--lp-text-primary)" }}>
                    How we built this,<br />step by step.
                </h1>
                <p className="font-body text-[16px] mb-10" style={{ color: "var(--lp-text-secondary)" }}>
                    Every feature, every decision, every mistake — documented openly.
                </p>

                {/* Progress bar */}
                <div className="rounded-2xl p-6 mb-16" style={{ background: "var(--lp-surface)", border: "1px solid var(--lp-border)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-body font-medium text-[13px]" style={{ color: "var(--lp-text-secondary)" }}>
                            {shipped} of {total} milestones shipped
                        </span>
                        <span className="font-body font-semibold text-[13px]" style={{ color: "var(--lp-text-primary)" }}>
                            {Math.round((shipped / total) * 100)}%
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--lp-border)" }}>
                        <div
                            className="h-full rounded-full bg-[#22c55e] transition-all"
                            style={{ width: `${(shipped / total) * 100}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        {(["shipped", "building", "planned"] as Status[]).map((s) => (
                            <div key={s} className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ background: STATUS_CONFIG[s].dot }} />
                                <span className="font-body text-[12px]" style={{ color: "var(--lp-text-muted)" }}>
                                    {STATUS_CONFIG[s].label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical line */}
                    <div
                        className="absolute left-[11px] top-2 bottom-2 w-px"
                        style={{ background: "var(--lp-border)" }}
                    />

                    <div className="space-y-12">
                        {entries.map((entry) => {
                            const cfg = STATUS_CONFIG[entry.status];
                            return (
                                <div key={entry.version} className="relative pl-10">
                                    {/* Timeline dot */}
                                    <div
                                        className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-4 flex items-center justify-center"
                                        style={{
                                            background: "var(--lp-bg-primary)",
                                            borderColor: entry.status === "shipped" ? cfg.dot : "var(--lp-border)",
                                        }}
                                    >
                                        {entry.status === "shipped" && (
                                            <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                                        )}
                                        {entry.status === "building" && (
                                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: cfg.dot }} />
                                        )}
                                    </div>

                                    {/* Card */}
                                    <div
                                        className="rounded-2xl p-6"
                                        style={{ background: "var(--lp-surface)", border: "1px solid var(--lp-border)" }}
                                    >
                                        {/* Top row */}
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span
                                                className="font-body font-bold text-[12px] px-2.5 py-0.5 rounded-md"
                                                style={{ background: "var(--lp-surface-raised)", color: "var(--lp-text-muted)" }}
                                            >
                                                {entry.version}
                                            </span>
                                            <span className="font-body text-[12px]" style={{ color: "var(--lp-text-muted)" }}>
                                                {entry.date}
                                            </span>
                                            <span className={`font-body font-semibold text-[11px] px-2.5 py-0.5 rounded-full ${cfg.badge} ${cfg.text}`}>
                                                {cfg.label}
                                            </span>
                                        </div>

                                        {/* Title + description */}
                                        <h3 className="font-heading font-semibold text-[18px] mb-1.5" style={{ color: "var(--lp-text-primary)" }}>
                                            {entry.title}
                                        </h3>
                                        <p className="font-body text-[14px] mb-4 leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
                                            {entry.description}
                                        </p>

                                        {/* Items */}
                                        <ul className="space-y-1.5">
                                            {entry.items.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2.5">
                                                    <span
                                                        className="mt-[7px] w-1 h-1 rounded-full shrink-0"
                                                        style={{ background: cfg.dot }}
                                                    />
                                                    <span className="font-body text-[13px] leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: "var(--lp-surface)", border: "1px solid var(--lp-border)" }}>
                    <p className="font-heading font-semibold text-[18px] mb-2" style={{ color: "var(--lp-text-primary)" }}>
                        Have a feature idea?
                    </p>
                    <p className="font-body text-[14px] mb-6" style={{ color: "var(--lp-text-muted)" }}>
                        EmailHQ is open source. Open an issue or start a discussion on GitHub.
                    </p>
                    <a
                        href="https://github.com/meetpatell07/email-sparrowhq"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-body font-semibold text-[14px] px-6 py-3 rounded-xl border transition-opacity hover:opacity-80"
                        style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-secondary)" }}
                    >
                        View on GitHub
                    </a>
                </div>

            </main>

            <Footer />
        </div>
    );
}
