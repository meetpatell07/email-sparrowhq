/**
 * service_worker.js — SparrowHQ extension background service worker.
 * Handles install events, context menu registration, and message relay.
 */

const ONBOARDING_URL = "https://email.sparrowhq.co";

// ── Install / update ──────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({ url: ONBOARDING_URL });
    }
    registerContextMenu();
});

// Re-register on browser startup (service workers are ephemeral)
chrome.runtime.onStartup.addListener(registerContextMenu);

// ── Context menu ──────────────────────────────────────────────────────────────

function registerContextMenu() {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "sparrowhq-draft-selection",
            title: "Draft email from selection",
            contexts: ["selection"],
        });
    });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== "sparrowhq-draft-selection") return;
    if (!tab?.id) return;

    const selectedText = info.selectionText ?? "";

    // Store the selection so the popup can read it on open
    chrome.storage.session.set({
        pendingSelection: {
            text: selectedText,
            url: tab.url ?? "",
            title: tab.title ?? "",
            ts: Date.now(),
        },
    });

    // Open the extension popup by opening the popup URL in a new window
    // Chrome MV3 doesn't allow programmatic popup open, so we open the popup
    // as a small window instead
    chrome.windows.create({
        url: chrome.runtime.getURL("popup/popup.html"),
        type: "popup",
        width: 400,
        height: 560,
    });
});
