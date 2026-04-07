# SparrowHQ Chrome Extension

Draft context-aware emails from any webpage using your SparrowHQ account — without leaving your browser.

## Features

| Feature | Description |
|---|---|
| **Draft from any page** | Open the popup on any webpage, describe your intent, and get a structured Gmail draft in seconds |
| **Right-click to draft** | Select any text on a page → right-click → "Draft email from selection" — the selected text is pre-loaded as context |
| **LinkedIn contact import** | On any `linkedin.com/in/` profile, the popup detects the person's name, title, and company and lets you import them with one click |
| **Writing style learning** | Every draft you approve teaches the AI your preferred tone and structure — drafts improve over time |

All AI and Gmail logic runs on the SparrowHQ backend. The extension never reads your Gmail directly.

---

## How it works

### Standard flow
1. Open the extension popup on any page (job listing, pricing page, article, etc.)
2. The content script extracts the page title, URL, and visible text (stripping nav, ads, footers)
3. Enter a recipient email address and a short intent ("follow up on this job posting", "ask about the Enterprise plan")
4. The extension calls `POST /api/drafts/from-context` with the page context and your intent
5. The AI generates a structured draft, saves it to your Gmail Drafts, and shows a preview
6. The draft is also visible in the SparrowHQ dashboard under **Drafts**

### Right-click flow
1. Select any text on a page
2. Right-click → **Draft email from selection**
3. The popup opens with the selection pre-loaded in the intent field — just add a recipient and submit

### LinkedIn flow
1. Open any LinkedIn profile (`linkedin.com/in/...`)
2. Click the SparrowHQ extension icon
3. A blue banner appears with the person's name, title, and company
4. Click **Import** — the recipient field is auto-filled (if email is public) and the intent is pre-populated
5. Edit and submit as usual

---

## Prerequisites

- Google Chrome (or a Chromium-based browser)
- A SparrowHQ account — sign in at [https://email.sparrowhq.co](https://email.sparrowhq.co) in the **same browser profile** you load the extension into (auth is cookie-based, no separate login needed)

---

## Setup

### 1. Generate icons

Before loading the extension, generate the PNG icons:

```bash
node icons/generate-icons.js
```

This creates `icon16.png`, `icon48.png`, and `icon128.png` — the SparrowHQ bird mark on a white circular background, rasterised from the brand SVG paths in pure Node.js with no external dependencies.

### 2. Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle, top-right)
3. Click **Load unpacked**
4. Select the `packages/extension/` folder

Pin the SparrowHQ icon to your toolbar for quick access.

### 3. Sign in

Make sure you are signed into SparrowHQ at [https://email.sparrowhq.co](https://email.sparrowhq.co) in the same Chrome profile. The extension reads your session cookie — no separate login step.

---

## Local development

To point the extension at a local dev server, open `popup/popup.js` and change the first constant:

```js
const SPARROWHQ_API_URL = "http://localhost:3000";
```

Reload the extension from `chrome://extensions` after saving.

> **Note:** Chrome blocks `credentials: 'include'` requests to plain `http://` origins in some configurations. If you hit CORS or cookie errors locally, use an HTTPS tunnel (`ngrok`, `cloudflared`) and update both `SPARROWHQ_API_URL` and the `host_permissions` entry in `manifest.json` to match.

---

## Permissions

| Permission | Why it's needed |
|---|---|
| `activeTab` | Read the current page's title, URL, and content for context extraction |
| `storage` | Cache the session token locally (5-minute TTL) to avoid redundant auth round-trips |
| `scripting` | Inject the content script into pages that were loaded before the extension was installed |
| `contextMenus` | Register the "Draft email from selection" right-click menu item |
| `host_permissions: email.sparrowhq.co` | Make credentialed API calls to the SparrowHQ backend |
| `host_permissions: mail.google.com` | (Reserved for future Gmail sidebar integration) |

---

## File structure

```
packages/extension/
├── manifest.json                 Manifest V3 config
├── popup/
│   ├── popup.html                Extension popup UI (6 states)
│   ├── popup.css                 Dark-theme styles + LinkedIn / selection banners
│   └── popup.js                  Auth, page extraction, LinkedIn import, selection pre-fill, draft submission
├── content/
│   └── content.js                Injected into pages — extracts structured text + LinkedIn contact data
├── background/
│   └── service_worker.js         Registers context menu, handles right-click → draft flow
├── icons/
│   ├── generate-icons.js         Run with Node to rasterise brand icons (no external deps)
│   ├── icon16.png                (generated)
│   ├── icon48.png                (generated)
│   └── icon128.png               (generated)
└── README.md
```

---

## API endpoints used

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/ext/session` | `GET` | Validate current user session (CORS-enabled) |
| `/api/drafts/from-context` | `POST` | Generate a draft from page context + intent |

Rate limit: 10 drafts per hour per user (enforced server-side via Upstash Ratelimit).
