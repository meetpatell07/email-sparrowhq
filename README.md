# EmailHQ

An AI-powered email management platform that connects to Gmail, Google Calendar, and Google Drive. Automatically classifies emails into smart categories, generates calendar-aware draft replies, extracts invoice data, applies Gmail labels in real time via a Google Cloud Pub/Sub + QStash pipeline, stores attachments in Cloudflare R2, and lets you manage your inbox through a conversational AI assistant — all from a minimal, mobile-responsive dashboard.

## Features

- **Privacy-First Architecture** — No email content (subject, body, sender, snippet) is ever written to the database. All display data is fetched live from Gmail API and cached in Redis. Only operational metadata (`gmailId`, `threadId`, `receivedAt`, `categories`) is persisted.
- **Real-time Ingestion Pipeline** — Gmail Pub/Sub push → QStash queue → per-email processing with automatic retries. No polling required.
- **Smart Classification** — Classifies every email into one or two categories: `Priority`, `Follow Up`, `Planned`, `Finance`, `Personal`, `Notification`, or `Marketing` using an AI model with Zod schema validation.
- **Gmail Label Sync** — Creates and applies colour-coded labels directly in Gmail automatically on every ingest. Labels are namespaced to avoid conflicts with Gmail system labels (`Priority` instead of `Important`, `Planned` instead of `Scheduled`).
- **Calendar-Aware Draft Replies** — Before generating a reply draft, the pipeline checks your Google Calendar for availability and upcoming events. If someone asks "can we meet Thursday at 2pm?" and you're already booked, the draft suggests an alternative slot from your real calendar. Calendar context is fetched with a 4-second timeout so it never blocks processing. Only relevant categories (`Priority`, `Follow Up`, `Planned`) trigger a calendar lookup.
- **Invoice Extraction** — Detects finance emails and extracts vendor name, amount, currency, and due date into a structured invoices table.
- **Attachment Vault** — Email attachments uploaded to Cloudflare R2, browseable in the Vault with download, save-to-Drive, and draft-reply actions.
- **AI Chat Assistant** — Natural language interface: draft replies (with calendar context), check calendar, create events, list emails — powered by the same AI model.
- **Google Calendar** — View events for the next 7 days grouped by date cards. Each card shows event title, time, and duration. Click the arrow icon to jump to that day in Google Calendar.
- **Google Drive Browser** — Browse all Drive files (Docs, Sheets, Slides, PDFs) with list/grid toggle, file detail panel, open-in-Drive, and send-as-email actions.
- **Connected Accounts** — Settings page shows live connection status per Google account (token health, Gmail watch expiry, granted scopes) with one-click reconnect and disconnect.
- **Mobile-Responsive** — Full bottom navigation, slide-in sidebar drawer, and responsive tables on all screen sizes.
- **Vercel Analytics** — Page view tracking via `@vercel/analytics`.

## Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Framework    | Next.js 15 (App Router)                         |
| Database     | Neon PostgreSQL + Drizzle ORM                   |
| Auth         | Better Auth with Google OAuth 2.0               |
| AI / LLM     | Ollama (local) — configurable model via env     |
| APIs         | Gmail API, Google Calendar API, Drive API v3    |
| Pub/Sub      | Google Cloud Pub/Sub (real-time Gmail push)     |
| Queue        | Upstash QStash (async per-email processing)     |
| Cache        | Upstash Redis                                   |
| Storage      | Cloudflare R2 (email attachments)               |
| Styling      | Tailwind CSS v4                                 |
| Analytics    | Vercel Analytics                                |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Google Cloud project with Gmail, Calendar, and Drive APIs enabled + Pub/Sub topic configured
- Upstash account (Redis + QStash)
- Ollama instance (local or remote) with a model loaded

### Environment Variables

Create a `.env.local` file:

```env
# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=your-secret-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Google Cloud Pub/Sub
PUBSUB_WEBHOOK_SECRET=random-secret-token

# AI (Ollama)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Upstash Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Upstash QStash
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...

# Cloudflare R2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com

# Token encryption (exactly 32 characters)
ENCRYPTION_KEY=your-32-char-encryption-key-here
```

### Installation

```bash
npm install

# Push database schema
npx drizzle-kit push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

## How the Ingestion Pipeline Works

```
Gmail receives email
  │
  └─ Google Cloud Pub/Sub push → POST /api/gmail/webhook
       ├─ Validate shared secret
       ├─ Decode notification (emailAddress + historyId)
       ├─ Look up user by email in DB
       └─ Publish to QStash → POST /api/ingest/process-history
            │  (retries up to 3× on failure)
            │
            └─ Per-message processing
                 ├─ Label pre-check (format=minimal) — skip DRAFT/SENT/SPAM/TRASH
                 ├─ Redis dedup check (processed:{messageId})
                 ├─ Fetch full Gmail message
                 ├─ Guard: skip if DRAFT or SENT label
                 ├─ Guard: skip if sender is self
                 ├─ Decode body (handles multipart nesting) — in memory only
                 ├─ Insert email record (gmailId, threadId, receivedAt only)
                 ├─ Upload attachments → Cloudflare R2
                 ├─ Classify with AI → update categories in DB
                 ├─ Apply Gmail label (awaited — not fire-and-forget)
                 ├─ If finance → extract invoice data → store
                 ├─ If important/follow_up/planned →
                 │    ├─ Fetch calendar availability + events (4s timeout guard)
                 │    ├─ Check thread dedup → skip if draft already exists
                 │    ├─ Generate calendar-aware draft reply
                 │    └─ Save draft to Gmail Drafts + drafts table (no content stored)
                 └─ Invalidate Redis email list cache
```

## Calendar-Aware Drafting

All draft generation — whether triggered by the ingest pipeline or the AI chat assistant — goes through a shared `getCalendarContextForDraft` helper in `src/lib/calendar-context.ts`.

The helper:
1. Checks if the email's categories are scheduling-relevant (`important`, `follow_up`, `planned`). Non-relevant categories (marketing, notification, personal, finance) skip the calendar lookup entirely.
2. For `planned` emails, fetches a 7-day event window. For `important`/`follow_up`, fetches today's availability only.
3. Uses a 4-second `Promise.race` timeout so a slow Calendar API response never delays the draft.
4. Returns a structured `[Calendar Context]` block that the AI model uses to propose real free time slots instead of generic placeholders.

In the AI chat handler, Gmail metadata and calendar context are fetched in parallel via `Promise.all` to minimise latency.

## Privacy-First Data Model

Email content is never written to the database. The ingestion pipeline processes content entirely in memory (for AI classification, label application, and draft generation), then discards it. All display data is fetched live from Gmail API.

### What is stored in the database

| Table         | Stored fields                                                        |
|---------------|----------------------------------------------------------------------|
| `emails`      | `gmailId`, `threadId`, `userId`, `receivedAt`, `categories`, `isProcessed` |
| `drafts`      | `gmailDraftId`, `emailId`, `status` (content lives in Gmail Drafts) |
| `attachments` | `r2Key`, `filename`, `contentType`, `size`, `emailId`               |
| `invoices`    | `vendorName`, `amount`, `currency`, `dueDate`, `extractedData`      |

### What is never stored

- Email subject, body, snippet
- Sender and recipient addresses
- Draft reply content
- Raw attachment data (files go to R2, not the DB)

### Email list caching

The latest 20 emails are cached in Redis per user (`emails:{userId}`, 5-minute TTL). The cache stores the full enriched response — Gmail content merged with DB categories — so the UI remains fast. The cache is invalidated immediately when a new email is processed by the ingestion pipeline.

## Email Categories

| Category       | Gmail Label   | Colour     | Triggers Draft |
|----------------|---------------|------------|----------------|
| `important`    | Priority      | Red        | ✅              |
| `follow_up`    | Follow Up     | Blue       | ✅              |
| `scheduled`    | Planned       | Green      | ✅              |
| `finance`      | Finance       | Dark Green | ❌ (invoice extraction instead) |
| `personal`     | Personal      | Purple     | ❌              |
| `notification` | Notification  | Orange     | ❌              |
| `marketing`    | Marketing     | Dark Red   | ❌              |

> **Note:** Gmail label names differ from internal category keys to avoid conflicts with Gmail's built-in system labels (`IMPORTANT`, `SCHEDULED`).

## Draft Loop Prevention

The pipeline has three layers of defence against infinite draft creation loops:

1. **Label pre-check** (`process-history/route.ts`) — fetches message metadata with `format=minimal` before any processing; skips messages with `DRAFT`, `SENT`, `SPAM`, or `TRASH` labels immediately.
2. **Label guard** (`processSingleEmail`) — skips messages whose `labelIds` contain `DRAFT` or `SENT` after full fetch.
3. **Thread deduplication** (`processSingleEmail`) — queries the `drafts` table before creating a new draft; skips if the thread already has one.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/                  # Better Auth endpoints
│   │   ├── emails/                # Email list (Redis-cached, live Gmail fetch)
│   │   ├── calendar/              # Calendar events + availability
│   │   ├── chat/                  # AI chat (rate-limited)
│   │   ├── drafts/                # Draft status + live content from Gmail Drafts API
│   │   ├── drive/                 # Drive file browser
│   │   ├── vault/                 # Attachment vault + R2 actions
│   │   ├── settings/connections/  # Connected account info
│   │   └── ingest/
│   │       ├── route.ts           # Manual sync trigger
│   │       └── process-history/   # QStash callback handler
│   ├── gmail/webhook/             # Google Pub/Sub push receiver
│   ├── dashboard/
│   │   ├── page.tsx               # Overview (Gmail · Drive · Calendar tabs)
│   │   ├── emails/                # Inbox list
│   │   ├── email/[id]/            # Email detail view
│   │   ├── drafts/                # AI draft review & approval
│   │   ├── vault/                 # Attachment vault
│   │   ├── drive/                 # Google Drive browser
│   │   ├── categories/            # Category reference
│   │   ├── settings/              # Account, connections, sign-out
│   │   └── profile/               # Profile page
│   ├── about/                     # Product story & open source rationale
│   ├── roadmap/                   # Changelog + future plans timeline
│   ├── login/                     # Auth page
│   ├── privacy/                   # Privacy Policy
│   └── terms/                     # Terms of Service
├── components/
│   ├── DashboardLayout.tsx        # Shell: sidebar, header, bottom nav, AI chat
│   ├── Sidebar.tsx                # Desktop nav + mobile drawer
│   ├── AIChatPanel.tsx            # Right-panel AI assistant
│   ├── EmailRow.tsx               # Email list item with live classification
│   ├── DriveFilesTab.tsx          # Drive file grid/list (viewMode prop)
│   ├── SignOutButton.tsx          # Parallel sign-out + token clear
│   └── landing/                   # Landing page sections (Hero, Features, Footer, etc.)
└── lib/
    ├── ai.ts                      # classify, generateDraft, extractInvoice
    ├── auth.ts                    # Better Auth + encrypted token adapter
    ├── calendar.ts                # Google Calendar client
    ├── calendar-context.ts        # Shared calendar-aware context builder for drafts
    ├── gmail.ts                   # Gmail client, label management, live fetch helpers
    ├── ingest.ts                  # listNewEmailIds + processSingleEmail
    ├── encryption.ts              # AES-256-CBC token encryption
    ├── redis.ts                   # Upstash Redis client
    ├── s3.ts                      # Cloudflare R2 client
    ├── qstash.ts                  # QStash client + receiver
    └── db/                        # Drizzle schema & connection
```

## Security

- Google OAuth refresh tokens encrypted at rest with AES-256-CBC before DB storage
- All Google API calls are server-side only — no tokens exposed to the client
- QStash webhook signatures verified on every ingest callback
- Gmail Pub/Sub webhook validated via shared secret query parameter
- Connected account disconnect clears both access and refresh tokens from DB
- **No email content is ever persisted** — subject, body, sender, snippet, and draft text exist only in memory during processing and in Gmail itself
- Raw email body content is never persisted beyond the processing request

## License

MIT
