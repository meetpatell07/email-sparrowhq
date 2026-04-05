# EmailHQ Chrome Extension

Draft context-aware emails from any webpage using your EmailHQ account — without leaving your browser.

## How it works

When you open the extension popup on any page, it reads the page title, URL, and visible text (stripping navigation and boilerplate). You type a recipient address and a short intent ("follow up on this job posting", "ask about pricing"). The extension calls the EmailHQ API, which uses the page context and your intent to generate a professional email draft via the AI pipeline, saves it to your Gmail Drafts, and shows you a preview. The draft also appears in your EmailHQ dashboard under Drafts.

All AI and Gmail logic runs on the EmailHQ backend — the extension never accesses Gmail directly.

## Prerequisites

- Google Chrome (or Chromium-based browser)
- An EmailHQ account: sign in at [https://email.sparrowhq.co](https://email.sparrowhq.co) in the **same browser profile** you load the extension into — auth is cookie-based

## Setup

### 1. Generate placeholder icons

The extension needs PNG icons before Chrome will load it:

```bash
node icons/generate-icons.js
```

This creates `icons/icon16.png`, `icons/icon48.png`, and `icons/icon128.png` as solid dark squares. Replace them with real brand assets when ready.

### 2. Load the extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `packages/extension/` directory

The EmailHQ icon will appear in your toolbar. Pin it for easy access.

### 3. Sign in

Make sure you are signed into EmailHQ in the same Chrome profile. The extension reads your session cookie — no separate login is needed.

## Local development

To point the extension at a local dev server instead of production, open `popup/popup.js` and change the first constant:

```js
const SPARROWHQ_API_URL = "http://localhost:3000";
```

Reload the extension from `chrome://extensions` after saving.

> **Note:** Chrome will block `credentials: 'include'` requests to `http://` origins from extensions on some versions. If you hit CORS or cookie errors locally, use an HTTPS tunnel (e.g. `ngrok`) and update the URL and the `host_permissions` in `manifest.json` to match.

## File structure

```
packages/extension/
├── manifest.json               Manifest V3 config
├── popup/
│   ├── popup.html              Extension popup UI
│   ├── popup.css               Dark-theme styles
│   └── popup.js                Auth check, content extraction, draft submission
├── content/
│   └── content.js              Injected into pages — extracts title, URL, text
├── background/
│   └── service_worker.js       Opens onboarding on install
├── icons/
│   ├── generate-icons.js       Run with Node to create placeholder PNGs
│   ├── icon16.png              (generated)
│   ├── icon48.png              (generated)
│   └── icon128.png             (generated)
└── README.md
```
