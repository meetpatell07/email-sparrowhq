# SparrowHQ

An AI-powered email management platform that connects to Gmail, Google Calendar, and Google Drive. Automatically classifies emails into smart categories, generates draft replies, extracts invoice data, applies Gmail labels in real time via a Google Cloud Pub/Sub + QStash pipeline, stores attachments in Cloudflare R2, and lets you manage your inbox through a conversational AI assistant — all from a minimal, mobile-responsive dashboard.

## Features

- **Real-time Ingestion Pipeline** — Gmail Pub/Sub push → QStash queue → per-email processing with automatic retries. No polling required.
- **Smart Classification** — Classifies every email into a single category: `Important`, `Follow Up`, `Scheduled`, `Finance`, `Personal`, `Notification`, or `Marketing` using a local Ollama/LLM model.
- **Gmail Label Sync** — Creates and applies colour-coded labels directly in Gmail automatically on every ingest, keeping your inbox organised without visiting the dashboard.
- **Auto-Draft Replies** — Generates AI reply drafts for `Important`, `Follow Up`, and `Scheduled` emails, saved to Gmail Drafts with a pending-approval workflow.
- **Invoice Extraction** — Detects finance emails and extracts vendor name, amount, currency, and due date into a structured invoices table.
- **Attachment Vault** — Email attachments uploaded to Cloudflare R2, browseable in the Vault with download, save-to-Drive, and draft-reply actions.
- **AI Chat Assistant** — Natural language interface: draft replies, check calendar, create events, list emails — powered by the same local LLM.
- **Google Calendar** — View events grouped by day with attendee avatars, duration, and Google Meet join links. Covers past and upcoming events.
- **Google Drive Browser** — Browse all Drive files (Docs, Sheets, Slides, PDFs) with category filter tabs, file detail panel, open-in-Drive, and send-as-email actions.
- **Connected Accounts** — Settings page shows live connection status per Google account (token health, Gmail watch expiry, granted scopes) with one-click reconnect and disconnect.
- **Mobile-Responsive** — Full bottom navigation, slide-in sidebar drawer, and responsive tables on all screen sizes.
- **Vercel Analytics** — Page view tracking via `@vercel/analytics`.

## Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Framework    | Next.js (App Router)                            |
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
            └─ processSingleEmail(userId, messageId)
                 ├─ Fetch full Gmail message
                 ├─ Decode body (handles multipart nesting)
                 ├─ Insert email record (skip if duplicate)
                 ├─ Upload attachments → Cloudflare R2
                 ├─ Classify with AI → update category in DB
                 ├─ Apply Gmail label (awaited — not fire-and-forget)
                 ├─ If finance → extract invoice data → store
                 └─ If important/follow_up/scheduled → generate draft
                      └─ Save to Gmail Drafts + drafts table
```

## Email Categories

| Category       | Colour  | Triggers Draft |
|----------------|---------|----------------|
| `important`    | Red     | ✅              |
| `follow_up`    | Blue    | ✅              |
| `scheduled`    | Green   | ✅              |
| `finance`      | Dark Green | ❌ (invoice extraction instead) |
| `personal`     | Purple  | ❌              |
| `notification` | Orange  | ❌              |
| `marketing`    | Dark Red| ❌              |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/                  # Better Auth endpoints
│   │   ├── emails/                # Fetch & get single email
│   │   ├── calendar/              # Calendar events + availability
│   │   ├── chat/                  # AI chat (rate-limited)
│   │   ├── drafts/                # Draft CRUD
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
│   ├── login/                     # Auth page
│   ├── privacy/                   # Privacy Policy
│   └── terms/                     # Terms of Service
├── components/
│   ├── DashboardLayout.tsx        # Shell: sidebar, header, bottom nav, AI chat
│   ├── Sidebar.tsx                # Desktop nav + mobile drawer
│   ├── AIChatPanel.tsx            # Right-panel AI assistant
│   ├── EmailRow.tsx               # Email list item with live classification
│   ├── DriveFilesTab.tsx          # Drive file grid
│   └── SignOutButton.tsx          # Parallel sign-out + token clear
└── lib/
    ├── ai.ts                      # classify, generateDraft, extractInvoice
    ├── auth.ts                    # Better Auth + encrypted token adapter
    ├── calendar.ts                # Google Calendar client
    ├── gmail.ts                   # Gmail client + label management
    ├── ingest.ts                  # listNewEmailIds + processSingleEmail
    ├── encryption.ts              # AES-256-CBC token encryption
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
- Raw email body content is never persisted beyond the processing request

## License

MIT
