# EmailHQ

An AI-powered email management platform that connects to Gmail, Google Calendar, and Google Drive. Automatically categorises emails, generates draft replies, extracts invoice data, manages your inbox through a conversational AI assistant, and lets you browse and act on Drive files — all from a single dashboard.

## Features

- **Smart Categorisation** — Classifies emails as Personal, Invoice, Client, Urgent, Marketing, or Notification using Groq (Llama 3.3)
- **Auto-Draft Replies** — Generates AI drafts for urgent and client emails, saved directly to Gmail Drafts
- **Invoice Extraction** — Detects invoices and extracts vendor name, amount, currency, and due date
- **AI Chat Assistant** — Natural language commands: draft replies, check calendar, create events, list emails
- **Google Calendar** — View schedule, check availability, and create events via the chat panel
- **Google Drive Browser** — Browse all Drive files (Docs, Sheets, Slides, PDFs) with filter tabs, open in Drive, or compose an email with the file link
- **Redis Caching** — Email list and Drive file list cached in Upstash Redis for fast dashboard loads
- **Async Ingestion Pipeline** — Cron-triggered ingest publishes per-email jobs to Upstash QStash; each email is processed independently with automatic retries
- **Rate Limiting** — Upstash Redis rate limits on ingest (1/min) and AI chat (20 req/min per user)
- **Attachment Storage** — Email attachments uploaded to Cloudflare R2

## Tech Stack

| Layer        | Technology                                   |
|--------------|----------------------------------------------|
| Framework    | Next.js 16 (App Router)                      |
| Database     | Neon PostgreSQL + Drizzle ORM                |
| Auth         | Better Auth with Google OAuth 2.0            |
| AI           | Groq API — `llama-3.3-70b-versatile`         |
| APIs         | Gmail API, Google Calendar API, Drive API v3 |
| Queue        | Upstash QStash (async email processing)      |
| Cache        | Upstash Redis (email list, drive files)      |
| Rate Limit   | Upstash Ratelimit                            |
| Storage      | Cloudflare R2 (email attachments)            |
| Styling      | Tailwind CSS v4                              |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Google Cloud project with Gmail, Calendar, and Drive APIs enabled
- Upstash account (Redis + QStash)
- Groq API key

### Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=your-secret
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# AI
GROQ_API_KEY=...

# Upstash Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Upstash QStash
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...

# Storage (Cloudflare R2)
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_ENDPOINT=...

# Cron (set a random secret and use it in your cron job's Authorization header)
CRON_SECRET=...

# Token encryption (exactly 32 characters)
ENCRYPTION_KEY=...
```

### Installation

```bash
pnpm install

# Push database schema
npx drizzle-kit push

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

## How the Ingestion Pipeline Works

```
GET /api/ingest  (triggered by external cron)
  │
  ├─ Rate limit check (Redis — 1 call/min globally)
  ├─ For each Google-linked user:
  │    └─ List new Gmail message IDs
  │         └─ Publish each as a QStash job → POST /api/ingest/process
  └─ Returns { queued: N }

POST /api/ingest/process  (called by QStash, retries up to 3×)
  ├─ Verify QStash signature
  ├─ Fetch full Gmail message
  ├─ Store email in DB
  ├─ Upload attachments to R2
  ├─ Classify with Groq AI → update category
  ├─ Apply Gmail label
  ├─ If invoice → extract data → store in invoices table
  └─ If urgent/client → generate draft → save to Gmail + DB
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/            # Better Auth endpoints
│   │   ├── emails/          # Fetch emails (Redis-cached)
│   │   ├── calendar/        # Calendar CRUD
│   │   ├── chat/            # AI chat (rate-limited)
│   │   ├── drafts/          # Draft management
│   │   ├── drive/           # Drive files (Redis-cached)
│   │   └── ingest/
│   │       ├── route.ts     # Cron trigger → publishes QStash jobs
│   │       └── process/     # QStash callback → processes one email
│   ├── dashboard/
│   │   ├── emails/          # Inbox view
│   │   ├── calendar/        # Calendar view
│   │   ├── drafts/          # AI draft review
│   │   ├── invoices/        # Invoice tracker
│   │   ├── categories/      # Category browser
│   │   ├── drive/           # Google Drive browser
│   │   ├── settings/        # User settings
│   │   └── profile/         # Profile page
│   ├── privacy/             # Privacy Policy
│   ├── terms/               # Terms of Service
│   └── login/               # Auth pages
├── components/
│   ├── AIChatPanel.tsx      # Right-panel AI chat
│   ├── DashboardLayout.tsx  # Layout wrapper
│   ├── EmailRow.tsx         # Email list item
│   └── Sidebar.tsx          # Navigation
└── lib/
    ├── ai.ts                # Groq: classify, draft, extract
    ├── auth.ts              # Better Auth config
    ├── calendar.ts          # Google Calendar client
    ├── drive.ts             # Google Drive client
    ├── gmail.ts             # Gmail API client
    ├── ingest.ts            # listNewEmailIds + processSingleEmail
    ├── redis.ts             # Upstash Redis client
    ├── ratelimit.ts         # Rate limiter instances
    ├── qstash.ts            # QStash client + receiver
    ├── encryption.ts        # AES-256 token encryption
    ├── s3.ts                # Cloudflare R2 client
    └── db/                  # Drizzle schema & connection
```

## Security

- Google OAuth refresh tokens encrypted at rest with AES-256-CBC
- All Google API calls are server-side only
- QStash webhook signature verified on every ingest callback
- Raw email body content not persisted beyond the processing request

## License

MIT
