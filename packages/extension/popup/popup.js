/**
 * popup.js — SparrowHQ Chrome extension popup logic.
 *
 * For local development, change SPARROWHQ_API_URL to your dev server:
 *   const SPARROWHQ_API_URL = "http://localhost:3000";
 */

const SPARROWHQ_API_URL = "https://email.sparrowhq.co";
// const SPARROWHQ_API_URL = "http://localhost:3000";

// ── DOM refs ─────────────────────────────────────────────────────────────────

const states = {
    loading:         document.getElementById("state-loading"),
    unauthenticated: document.getElementById("state-unauthenticated"),
    ready:           document.getElementById("state-ready"),
    generating:      document.getElementById("state-generating"),
    success:         document.getElementById("state-success"),
    error:           document.getElementById("state-error"),
};

const statusDot      = document.getElementById("status-dot");
const userAvatar     = document.getElementById("user-avatar");
const userEmail      = document.getElementById("user-email");
const pageFavicon    = document.getElementById("page-favicon");
const pageTitle      = document.getElementById("page-title");
const draftForm      = document.getElementById("draft-form");
const btnOpenApp     = document.getElementById("btn-open-app");
const btnDraft       = document.getElementById("btn-draft");
const btnAgain       = document.getElementById("btn-again");
const btnRetry       = document.getElementById("btn-retry");
const btnGmail       = document.getElementById("btn-gmail");
const subjectPrev    = document.getElementById("subject-preview");
const bodyPrev       = document.getElementById("body-preview");
const errorMsg       = document.getElementById("error-msg");

// New — LinkedIn + selection
const linkedInBanner      = document.getElementById("linkedin-banner");
const linkedInName        = document.getElementById("linkedin-name");
const linkedInTitleEl     = document.getElementById("linkedin-title");
const btnLinkedInImport   = document.getElementById("btn-linkedin-import");
const selectionBanner     = document.getElementById("selection-banner");
const selectionPreview    = document.getElementById("selection-preview");

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

            if (tab.title)      pageTitle.textContent  = tab.title;
            if (tab.favIconUrl) pageFavicon.src = tab.favIconUrl;

            chrome.tabs.sendMessage(tab.id, { action: "getPageContent" }, (response) => {
                if (chrome.runtime.lastError || !response) {
                    resolve({ title: tab.title || "", url: tab.url || "", content: "" });
                } else {
                    resolve(response);
                }
            });
        });
    });
}

// ── LinkedIn contact extraction ───────────────────────────────────────────────

let linkedInContact = null;

async function tryLinkedInExtract() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab?.id || !tab.url?.includes("linkedin.com/in/")) return resolve(null);

            chrome.tabs.sendMessage(tab.id, { action: "getLinkedInContact" }, (response) => {
                if (chrome.runtime.lastError || !response?.contact) return resolve(null);
                resolve(response.contact);
            });
        });
    });
}

// ── Pending selection (from right-click → context menu) ──────────────────────

async function checkPendingSelection() {
    return new Promise((resolve) => {
        chrome.storage.session.get(["pendingSelection"], (result) => {
            const sel = result.pendingSelection;
            if (!sel) return resolve(null);
            // Expire after 60 seconds
            if (Date.now() - sel.ts > 60000) {
                chrome.storage.session.remove(["pendingSelection"]);
                return resolve(null);
            }
            // Consume it — clear so it doesn't persist
            chrome.storage.session.remove(["pendingSelection"]);
            resolve(sel);
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

    statusDot.classList.add("connected");
    statusDot.title = `Connected as ${user.email}`;

    if (user.image) {
        userAvatar.src  = user.image;
        userAvatar.alt  = user.name || user.email;
    } else {
        userAvatar.style.display = "none";
    }
    userEmail.textContent = user.email;

    // ── Parallel: page content + LinkedIn contact + pending selection ─────────
    const [pageResult, linkedInResult, selectionResult] = await Promise.all([
        getPageContent().catch(() => ({ title: "", url: "", content: "" })),
        tryLinkedInExtract().catch(() => null),
        checkPendingSelection().catch(() => null),
    ]);

    pageData = pageResult;
    pageTitle.textContent = pageData.title || "(unknown page)";
    if (pageData.url) {
        try {
            const u = new URL(pageData.url);
            pageFavicon.src = `${u.origin}/favicon.ico`;
        } catch (_) {}
    }

    // ── LinkedIn banner ───────────────────────────────────────────────────────
    if (linkedInResult) {
        linkedInContact = linkedInResult;
        linkedInName.textContent = linkedInResult.name ?? "";
        linkedInTitleEl.textContent = [linkedInResult.title, linkedInResult.company]
            .filter(Boolean).join(" · ");
        linkedInBanner.classList.remove("hidden");
    }

    // ── Selection banner ──────────────────────────────────────────────────────
    if (selectionResult?.text) {
        const preview = selectionResult.text.length > 120
            ? selectionResult.text.slice(0, 120) + "…"
            : selectionResult.text;
        selectionPreview.textContent = `"${preview}"`;
        selectionBanner.classList.remove("hidden");

        // Pre-fill intent with the selected text as context
        const intentField = document.getElementById("intent");
        if (intentField && !intentField.value) {
            intentField.value = `Draft an email about the following:\n\n${selectionResult.text.slice(0, 400)}`;
        }

        // Override pageData with the selection's page info for the API call
        if (selectionResult.url) {
            pageData = {
                ...pageData,
                url:     selectionResult.url,
                title:   selectionResult.title || pageData.title,
                content: selectionResult.text,
            };
        }
    }

    showState("ready");
}

// ── LinkedIn import button ────────────────────────────────────────────────────

btnLinkedInImport?.addEventListener("click", () => {
    if (!linkedInContact) return;

    const recipientField = document.getElementById("recipient");
    const intentField    = document.getElementById("intent");

    // Auto-fill email if available, otherwise leave it for the user
    if (linkedInContact.email && recipientField) {
        recipientField.value = linkedInContact.email;
    }

    // Pre-fill intent with contact context
    if (intentField && !intentField.value) {
        const ctx = [
            linkedInContact.name,
            linkedInContact.title,
            linkedInContact.company,
        ].filter(Boolean).join(", ");
        intentField.value = `Reach out to ${ctx}`;
    }

    // Include contact info in the page content sent to the AI
    pageData = {
        ...pageData,
        content: [
            `LinkedIn Profile: ${linkedInContact.profileUrl}`,
            `Name: ${linkedInContact.name}`,
            linkedInContact.title   ? `Title: ${linkedInContact.title}`   : null,
            linkedInContact.company ? `Company: ${linkedInContact.company}` : null,
            linkedInContact.email   ? `Email: ${linkedInContact.email}`   : null,
            pageData.content,
        ].filter(Boolean).join("\n"),
    };

    // Flash the banner to confirm
    linkedInBanner.style.borderColor = "#0a66c2";
    setTimeout(() => { linkedInBanner.style.borderColor = ""; }, 800);

    document.getElementById("recipient")?.focus();
});

// ── Draft submission ──────────────────────────────────────────────────────────

draftForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const recipient = document.getElementById("recipient").value.trim();
    const intent    = document.getElementById("intent").value.trim();
    if (!recipient || !intent) return;

    showState("generating");

    try {
        const res = await fetch(`${SPARROWHQ_API_URL}/api/drafts/from-context`, {
            method: "POST",
            credentials: "include",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pageUrl:        pageData.url,
                pageTitle:      pageData.title,
                pageContent:    pageData.content,
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

        subjectPrev.textContent = data.subject;
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
    linkedInBanner.classList.add("hidden");
    selectionBanner.classList.add("hidden");
    showState("ready");
});

btnRetry.addEventListener("click", () => {
    showState("ready");
});

// ── Boot ──────────────────────────────────────────────────────────────────────

init();
