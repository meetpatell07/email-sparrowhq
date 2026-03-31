# SparrowHQ

An AI-powered email management platform that connects to Gmail and Google Calendar. Automatically categorizes emails, generates draft replies, extracts invoice data, and lets you manage your inbox through a conversational AI assistant.

## Features

- **Smart Categorization** — Classifies emails as Personal, Invoice, Client, Urgent, Marketing, or Notification
- **Auto-Draft Replies** — Generates AI drafts for urgent and client emails, saved to Gmail Drafts
- **Invoice Extraction** — Detects invoices and pulls out vendor, amount, and due date
- **AI Chat Assistant** — Natural language commands: draft replies, check calendar, create events
- **Google Calendar** — View schedule, check availability, create/delete events via chat
- **3-Column Dashboard** — Sidebar, content area, and collapsible AI chat panel

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Framework  | Next.js 16 (App Router)                 |
| Database   | Neon PostgreSQL + Drizzle ORM           |
| Auth       | Better Auth with Google OAuth           |
| AI         | Ollama (local) / Groq / OpenRouter      |
| APIs       | Gmail API, Google Calendar API          |
| Storage    | Cloudflare R2 (attachments)             |
| Styling    | Tailwind CSS v4                         |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Google Cloud project with Gmail & Calendar APIs enabled
- Ollama running locally, or API keys for Groq/OpenRouter

### Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# AI (choose one or more)
OLLAMA_URL=http://127.0.0.1:11434/api/generate
GROQ_API_KEY=...
OPENROUTER_API_KEY=...

# Storage (optional, for attachments)
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_ENDPOINT=...
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

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Better Auth endpoints
│   │   ├── emails/        # Fetch & sync emails
│   │   ├── calendar/      # Calendar CRUD
│   │   ├── chat/          # AI chat completions
│   │   ├── drafts/        # Draft management
│   │   └── ingest/        # Email ingestion pipeline
│   ├── dashboard/
│   │   ├── emails/        # Inbox view
│   │   ├── calendar/      # Calendar view
│   │   ├── drafts/        # AI drafts review
│   │   ├── invoices/      # Invoice tracker
│   │   ├── categories/    # Category browser
│   │   ├── settings/      # User settings
│   │   └── profile/       # Profile page
│   └── login/             # Auth pages
├── components/            # React components
│   ├── AIChatPanel        # Right-panel AI chat
│   ├── DashboardLayout    # 3-column layout wrapper
│   ├── EmailRow           # Email list item
│   └── Sidebar            # Navigation
└── lib/
    ├── ai.ts              # AI: classify, draft, extract
    ├── auth.ts            # Better Auth config
    ├── auth-client.ts     # Client-side auth helpers
    ├── calendar.ts        # Google Calendar client
    ├── gmail.ts           # Gmail API client
    ├── ingest.ts          # Email ingestion logic
    ├── encryption.ts      # Token encryption
    ├── s3.ts              # Cloudflare R2 client
    └── db/                # Drizzle schema & connection
```

## Security

- OAuth tokens encrypted at rest
- Server-side Google API calls only
- No email body content stored permanently (metadata only)

## License

MIT
