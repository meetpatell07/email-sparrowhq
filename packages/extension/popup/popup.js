/**
 * popup.js — EmailHQ Chrome extension popup logic.
 *
 * For local development, change SPARROWHQ_API_URL to your dev server:
 *   const SPARROWHQ_API_URL = "http://localhost:3000";
 */

const SPARROWHQ_API_URL = "https://email.sparrowhq.co";
// const SPARROWHQ_API_URL = "http://localhost:3000";

// ── DOM refs ─────────────────────────────────────────────────────────────────

const states = {
    loading: document.getElementById("state-loading"),
    unauthenticated: document.getElementById("state-unauthenticated"),
    ready: document.getElementById("state-ready"),
    generating: document.getElementById("state-generating"),
    success: document.getElementById("state-success"),
    error: document.getElementById("state-error"),
};

const statusDot = document.getElementById("status-dot");
const userAvatar = document.getElementById("user-avatar");
const userEmail = document.getElementById("user-email");
const pageFavicon = document.getElementById("page-favicon");
const pageTitle = document.getElementById("page-title");
const draftForm = document.getElementById("draft-form");
const btnOpenApp = document.getElementById("btn-open-app");
const btnDraft = document.getElementById("btn-draft");
const btnAgain = document.getElementById("btn-again");
const btnRetry = document.getElementById("btn-retry");
const btnGmail = document.getElementById("btn-gmail");
const subjectPrev = document.getElementById("subject-preview");
const bodyPrev = document.getElementById("body-preview");
const errorMsg = document.getElementById("error-msg");

// ── State machine ─────────────────────────────────────────────────────────────

function showState(name) {
    Object.entries(states).forEach(([key, el]) => {
        el.classList.toggle("hidden", key !== name);
    });
}

// ── Session cache ─────────────────────────────────────────────────────────────

const SESSION_KEY = "emailhq_session";
const SESSION_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedSession() {
    return new Promise((resolve) => {
        chrome.storage.session.get([SESSION_KEY], (result) => {
            const cached = result[SESSION_KEY];
            if (!cached) return resolve(null);
            if (Date.now() - cached.ts > SESSION_TTL) return resolve(null);
            resolve(cached.user);
        });
    });
}

function setCachedSession(user) {
    chrome.storage.session.set({ [SESSION_KEY]: { user, ts: Date.now() } });
}

function clearCachedSession() {
    chrome.storage.session.remove([SESSION_KEY]);
}

// ── Auth check ────────────────────────────────────────────────────────────────

async function checkSession() {
    const cached = await getCachedSession();
    if (cached) return cached;

    const res = await fetch(`${SPARROWHQ_API_URL}/api/ext/session`, {
        credentials: "include",
        mode: "cors",
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.user) return null;

    setCachedSession(data.user);
    return data.user;
}

// ── Page content extraction ───────────────────────────────────────────────────

async function getPageContent() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab?.id) return resolve({ title: "", url: "", content: "" });

            // Update the page title display immediately from tab metadata
            if (tab.title) {
                pageTitle.textContent = tab.title;
            }
            if (tab.favIconUrl) {
                pageFavicon.src = tab.favIconUrl;
            }

            chrome.tabs.sendMessage(tab.id, { action: "getPageContent" }, (response) => {
                if (chrome.runtime.lastError || !response) {
                    // Content script may not be injected (e.g. chrome:// pages)
                    resolve({ title: tab.title || "", url: tab.url || "", content: "" });
                } else {
                    resolve(response);
                }
            });
        });
    });
}

// ── Main init ─────────────────────────────────────────────────────────────────

let pageData = { title: "", url: "", content: "" };

async function init() {
    showState("loading");

    let user = null;
    try {
        user = await checkSession();
    } catch (_) {
        // Network error — treat as unauthenticated
    }

    if (!user) {
        statusDot.classList.remove("connected");
        statusDot.title = "Not connected";
        showState("unauthenticated");
        return;
    }

    // Connected
    statusDot.classList.add("connected");
    statusDot.title = `Connected as ${user.email}`;

    // Populate user row
    if (user.image) {
        userAvatar.src = user.image;
        userAvatar.alt = user.name || user.email;
    } else {
        userAvatar.style.display = "none";
    }
    userEmail.textContent = user.email;

    // Extract page content (best-effort)
    try {
        pageData = await getPageContent();
        pageTitle.textContent = pageData.title || "(unknown page)";
        if (pageData.url) {
            try {
                const u = new URL(pageData.url);
                pageFavicon.src = `${u.origin}/favicon.ico`;
            } catch (_) { }
        }
    } catch (_) {
        pageTitle.textContent = "(could not read page)";
    }

    showState("ready");
}

// ── Draft submission ──────────────────────────────────────────────────────────

draftForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const recipient = document.getElementById("recipient").value.trim();
    const intent = document.getElementById("intent").value.trim();
    if (!recipient || !intent) return;

    showState("generating");

    try {
        const res = await fetch(`${SPARROWHQ_API_URL}/api/drafts/from-context`, {
            method: "POST",
            credentials: "include",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pageUrl: pageData.url,
                pageTitle: pageData.title,
                pageContent: pageData.content,
                recipientEmail: recipient,
                intent,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            if (res.status === 401) clearCachedSession();
            showError(data.error || `Request failed (${res.status})`);
            return;
        }

        // Populate success state
        subjectPrev.textContent = data.subject;
        // Truncate body preview to ~200 chars
        const bodyText = data.body || "";
        bodyPrev.textContent = bodyText.length > 200 ? bodyText.slice(0, 200) + "…" : bodyText;
        btnGmail.href = data.gmailDraftsUrl || "https://mail.google.com/mail/#drafts";

        showState("success");
    } catch (err) {
        showError("Network error — check your connection.");
    }
});

// ── Error helpers ─────────────────────────────────────────────────────────────

function showError(msg) {
    errorMsg.textContent = msg || "Something went wrong.";
    showState("error");
}

// ── Button wiring ─────────────────────────────────────────────────────────────

btnOpenApp.addEventListener("click", () => {
    chrome.tabs.create({ url: SPARROWHQ_API_URL });
});

btnAgain.addEventListener("click", () => {
    draftForm.reset();
    showState("ready");
});

btnRetry.addEventListener("click", () => {
    showState("ready");
});

// ── Boot ──────────────────────────────────────────────────────────────────────

init();
