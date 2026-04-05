import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "About — EmailHQ",
    description: "How EmailHQ was born, why it's open source, and what we're building.",
};

export default function AboutPage() {
    return (
        <div style={{ background: "var(--lp-bg-primary)" }}>
            <Navbar />

            <main className="pt-32 pb-24 px-4 md:px-8 max-w-3xl mx-auto">

                {/* Eyebrow */}
                <p className="font-body text-[12px] uppercase tracking-widest mb-4" style={{ color: "var(--lp-text-muted)" }}>
                    Our story
                </p>

                {/* Title */}
                <h1 className="font-heading font-bold text-[38px] md:text-[52px] leading-[1.1] tracking-tight mb-8" style={{ color: "var(--lp-text-primary)" }}>
                    Built out of frustration.<br />Shipped out of obsession.
                </h1>

                {/* Hero pull quote */}
                <blockquote className="border-l-2 pl-5 mb-14" style={{ borderColor: "var(--lp-border)" }}>
                    <p className="font-body text-[18px] md:text-[20px] leading-relaxed italic" style={{ color: "var(--lp-text-secondary)" }}>
                        "I had 3,400 unread emails and zero idea which ones actually mattered.
                        I was spending more time managing email than doing the work that email was about."
                    </p>
                    <cite className="block mt-3 font-body text-[13px] not-italic" style={{ color: "var(--lp-text-muted)" }}>
                        — Meet Patel, founder
                    </cite>
                </blockquote>

                <div className="space-y-16 font-body text-[16px] leading-[1.8]" style={{ color: "var(--lp-text-secondary)" }}>

                    {/* Origin */}
                    <section>
                        <h2 className="font-heading font-semibold text-[22px] mb-4" style={{ color: "var(--lp-text-primary)" }}>
                            Where it started
                        </h2>
                        <p className="mb-4">
                            It was a Tuesday afternoon. I had just missed a client deadline — not because I forgot it,
                            but because the email confirming the date was buried under 47 newsletters,
                            12 automated notifications, and a chain of replies I had no business being CC&apos;d on.
                        </p>
                        <p className="mb-4">
                            I opened my Gmail, stared at the inbox, and thought: this is a solved problem.
                            We have large language models that can read and reason. We have APIs that can classify anything.
                            Why am I still manually triaging email like it&apos;s 2005?
                        </p>
                        <p>
                            That evening I started hacking on what would become EmailHQ.
                            The initial version was embarrassingly rough — a single Next.js API route
                            that would fetch my latest 5 emails and print their categories to the console.
                            But it worked. And it felt like magic.
                        </p>
                    </section>

                    {/* Pull stat */}
                    <div className="rounded-2xl p-8 text-center" style={{ background: "var(--lp-surface)", border: "1px solid var(--lp-border)" }}>
                        <p className="font-heading font-bold text-[48px] leading-none mb-2" style={{ color: "var(--lp-text-primary)" }}>
                            2.6 hrs
                        </p>
                        <p className="font-body text-[14px]" style={{ color: "var(--lp-text-muted)" }}>
                            Average time knowledge workers spend on email every single day
                        </p>
                    </div>

                    {/* The problem */}
                    <section>
                        <h2 className="font-heading font-semibold text-[22px] mb-4" style={{ color: "var(--lp-text-primary)" }}>
                            The real problem with email
                        </h2>
                        <p className="mb-4">
                            Email clients haven&apos;t fundamentally changed since the 1990s.
                            You get a list of messages, you open them one by one, you decide what to do,
                            you reply, you file, you archive. Repeat forever.
                        </p>
                        <p className="mb-4">
                            Modern inboxes have spam filters, tabs, and some fuzzy &quot;important&quot; heuristics —
                            but none of them actually understand what an email is asking you to do.
                            None of them can tell the difference between an invoice that needs payment today
                            and a newsletter you subscribed to three years ago and never read.
                        </p>
                        <p>
                            The problem isn&apos;t volume. It&apos;s signal.
                            EmailHQ was built to restore signal — to make the emails that matter
                            impossible to miss and the ones that don&apos;t matter invisible.
                        </p>
                    </section>

                    {/* How it helps */}
                    <section>
                        <h2 className="font-heading font-semibold text-[22px] mb-4" style={{ color: "var(--lp-text-primary)" }}>
                            How EmailHQ actually helps
                        </h2>
                        <p className="mb-4">
                            EmailHQ sits between your Gmail inbox and your attention.
                            Every email that arrives is automatically classified into one of seven categories —
                            Priority, Follow Up, Planned, Finance, Personal, Notification, or Marketing.
                            These labels sync back to Gmail so your existing workflow isn&apos;t disrupted.
                        </p>
                        <p className="mb-4">
                            For emails that require a reply, the AI drafts one automatically.
                            It checks your Google Calendar before writing — so if someone asks
                            &quot;can we meet Thursday at 2pm?&quot; and you already have a meeting,
                            the draft politely suggests an alternative slot it found in your actual calendar.
                        </p>
                        <p>
                            You review, tweak if needed, and hit send.
                            What used to take 20 minutes of context-switching takes 30 seconds.
                        </p>
                    </section>

                    {/* Privacy */}
                    <div className="rounded-2xl p-8" style={{ background: "var(--lp-surface)", border: "1px solid var(--lp-border)" }}>
                        <p className="font-heading font-semibold text-[13px] uppercase tracking-widest mb-3" style={{ color: "var(--lp-text-muted)" }}>
                            A note on privacy
                        </p>
                        <p className="mb-3">
                            EmailHQ is built on a privacy-first architecture.
                            Your email content — subjects, sender names, body text, draft replies —
                            is <strong style={{ color: "var(--lp-text-primary)" }}>never stored in our database</strong>.
                            It flows through in memory for AI processing and is immediately discarded.
                        </p>
                        <p style={{ color: "var(--lp-text-muted)" }} className="text-[14px]">
                            What we store: your Gmail message ID, thread ID, timestamp, and assigned categories.
                            That&apos;s it. The actual content lives only in your Gmail account.
                        </p>
                    </div>

                    {/* Open source */}
                    <section>
                        <h2 className="font-heading font-semibold text-[22px] mb-4" style={{ color: "var(--lp-text-primary)" }}>
                            Why open source?
                        </h2>
                        <p className="mb-4">
                            I went back and forth on this. Open source means anyone can see your mistakes,
                            copy your work, and point out everything you got wrong. It&apos;s uncomfortable.
                        </p>
                        <p className="mb-4">
                            But email is personal. You&apos;re granting this app access to some of the most
                            sensitive communications in your life — clients, finances, relationships.
                            You deserve to be able to verify exactly what the code does.
                            Not a privacy policy written by a lawyer. The actual code.
                        </p>
                        <p className="mb-4">
                            There&apos;s also a practical reason: I learned to build software from open source.
                            Thousands of repos, blog posts, and Stack Overflow answers from people who shared
                            their work freely. EmailHQ is my way of putting something back into that ecosystem.
                        </p>
                        <p>
                            If you find a bug, open an issue.
                            If you have a better approach, open a PR.
                            If you want to fork it and run it yourself — genuinely, go for it.
                        </p>
                    </section>

                    {/* What's next */}
                    <section>
                        <h2 className="font-heading font-semibold text-[22px] mb-4" style={{ color: "var(--lp-text-primary)" }}>
                            What&apos;s next
                        </h2>
                        <p className="mb-4">
                            EmailHQ is early. There are rough edges, missing features, and decisions
                            I&apos;ll probably revisit. But the core loop — ingest, classify, draft, approve —
                            works, and it already saves me significant time every day.
                        </p>
                        <p>
                            The roadmap includes team support, a mobile app, richer AI reasoning,
                            and deeper integrations with the tools people actually use alongside email.
                            You can follow the full journey on the{" "}
                            <Link href="/roadmap" className="underline underline-offset-4 transition-opacity hover:opacity-70" style={{ color: "var(--lp-text-primary)" }}>
                                roadmap page
                            </Link>.
                        </p>
                    </section>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 font-body font-semibold text-[14px] px-6 py-3 rounded-xl transition-opacity hover:opacity-80"
                            style={{ background: "var(--lp-accent)", color: "var(--lp-accent-fg)" }}
                        >
                            Try EmailHQ free
                        </Link>
                        <a
                            href="https://github.com/meetpatell07/email-sparrowhq"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 font-body font-medium text-[14px] px-6 py-3 rounded-xl border transition-opacity hover:opacity-80"
                            style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-secondary)" }}
                        >
                            View on GitHub
                        </a>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
