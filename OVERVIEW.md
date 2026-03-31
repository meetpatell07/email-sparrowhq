# SparrowHQ — Technical Overview

## Architecture

SparrowHQ is a Next.js 16 App Router application. All Google API calls happen server-side via API routes. The client authenticates with Better Auth (Google OAuth), receives a session cookie, and communicates only with the Next.js API layer — never directly with Google or the AI provider.

```
Browser → Next.js API Routes → Google APIs (Gmail, Calendar)
                             → AI Provider (Ollama / Groq / OpenRouter)
                             → Neon PostgreSQL (via Drizzle)
                             → Cloudflare R2 (attachments)
```

## Key Flows

### Email Ingestion (`/api/ingest`)

1. Fetch recent Gmail messages via the Gmail API
2. Parse headers and body (text/HTML stripped to plain text)
3. Run AI classification to assign a category label
4. For `urgent` and `client` emails, generate a draft reply and push it to Gmail Drafts
5. For `invoice` emails, extract vendor, amount, and due date
6. Persist email metadata to the database

### AI Classification & Drafting (`src/lib/ai.ts`)

Three core functions:
- `classifyEmail(subject, body)` → returns a `Category` enum value
- `draftReply(email, calendarContext)` → returns a draft reply string; optionally includes the user's free calendar slots
- `extractInvoice(body)` → returns `{ vendor, amount, dueDate }`

The AI layer is provider-agnostic. It defaults to Ollama locally and falls back to Groq or OpenRouter based on environment configuration.

### AI Chat (`/api/chat`)

Uses Vercel AI SDK streaming with tool calls. Registered tools:
- `getEmails` — fetch recent emails with optional category filter
- `getDraftReply` — generate a draft for a specific email
- `getCalendar` — fetch upcoming calendar events
- `createEvent` — create a Google Calendar event
- `deleteEvent` — delete a Google Calendar event

The chat panel is always available in the dashboard layout and collapses to a button on smaller viewports.

### Auth (`src/lib/auth.ts`)

Built on Better Auth with the Google provider. On first sign-in, the user's Gmail and Calendar OAuth tokens are stored encrypted (AES-256-GCM via `src/lib/encryption.ts`) in the database. Tokens are refreshed transparently on expiry.

## Database Schema

Managed with Drizzle ORM against Neon PostgreSQL.

Key tables:

| Table         | Purpose                                              |
|---------------|------------------------------------------------------|
| `users`       | Better Auth user records                             |
| `sessions`    | Active sessions                                      |
| `accounts`    | OAuth accounts + encrypted access/refresh tokens     |
| `emails`      | Email metadata, category label, invoice fields       |
| `drafts`      | AI-generated draft replies linked to source emails   |

## Dashboard Pages

| Route                      | Purpose                        |
|----------------------------|--------------------------------|
| `/dashboard`               | Home with quick-link cards     |
| `/dashboard/emails`        | Full inbox with category tabs  |
| `/dashboard/email/[id]`    | Single email thread view       |
| `/dashboard/calendar`      | Weekly calendar view           |
| `/dashboard/drafts`        | Review and discard AI drafts   |
| `/dashboard/invoices`      | Extracted invoice tracker      |
| `/dashboard/categories`    | Browse emails by category      |
| `/dashboard/settings`      | User preferences               |
| `/dashboard/profile`       | Account info                   |

## Component Architecture

All dashboard pages share `DashboardLayout`, which renders a fixed 3-column grid:

```
┌──────────┬──────────────────────────┬─────────────┐
│ Sidebar  │  <children>              │ AIChatPanel │
│ (nav)    │  (page content)          │ (collapsible│
└──────────┴──────────────────────────┴─────────────┘
```

`AIChatPanel` maintains its own `useChat` (Vercel AI SDK) state and streams responses from `/api/chat`.

## Environment Configuration

| Variable              | Required | Purpose                         |
|-----------------------|----------|---------------------------------|
| `DATABASE_URL`        | Yes      | Neon PostgreSQL connection      |
| `BETTER_AUTH_SECRET`  | Yes      | Session signing key             |
| `GOOGLE_CLIENT_ID`    | Yes      | OAuth app client ID             |
| `GOOGLE_CLIENT_SECRET`| Yes      | OAuth app client secret         |
| `OLLAMA_URL`          | No*      | Local Ollama endpoint           |
| `GROQ_API_KEY`        | No*      | Groq cloud AI key               |
| `OPENROUTER_API_KEY`  | No*      | OpenRouter AI key               |
| `R2_ACCESS_KEY_ID`    | No       | Cloudflare R2 access key        |
| `R2_SECRET_ACCESS_KEY`| No       | Cloudflare R2 secret            |
| `R2_BUCKET_NAME`      | No       | R2 bucket name                  |
| `R2_ENDPOINT`         | No       | R2 endpoint URL                 |

*At least one AI provider must be configured.

## Development Notes

- `pnpm` is the package manager
- `npx drizzle-kit push` syncs schema changes to the database (no migration files generated)
- The app uses Next.js server actions (`src/app/actions.ts`) for draft deletion and other mutations
- `src/app/dashboard/emails/page.tsx` is the most complex page — handles polling, category filtering, and bulk ingestion triggers
