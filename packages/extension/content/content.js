/**
 * content.js — Extracts page content for the EmailHQ extension.
 * Injected into every page at document_idle.
 * Responds to { action: "getPageContent" } messages from the popup.
 */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action !== "getPageContent") return;

    try {
        const title = document.title || "";
        const url = window.location.href;

        // Prefer semantic content containers over the entire body
        const contentEl =
            document.querySelector("article") ||
            document.querySelector("main") ||
            document.querySelector('[role="main"]') ||
            document.querySelector(".content") ||
            document.querySelector("#content") ||
            document.body;

        // Clone to avoid mutating the live DOM
        const clone = contentEl ? contentEl.cloneNode(true) : document.body.cloneNode(true);

        // Remove elements that pollute the text (nav, footer, scripts, styles, ads)
        const noise = ["nav", "footer", "script", "style", "noscript", "aside",
                       "header", "[role='navigation']", "[role='banner']",
                       "[role='complementary']", ".cookie-banner", "#cookie-banner"];
        noise.forEach((sel) => {
            try {
                clone.querySelectorAll(sel).forEach((el) => el.remove());
            } catch (_) { /* selector may not be supported */ }
        });

        const rawText = clone.innerText || clone.textContent || "";

        // Collapse whitespace and truncate to ~3000 words
        const words = rawText
            .replace(/\s+/g, " ")
            .trim()
            .split(" ")
            .filter(Boolean);
        const truncated = words.slice(0, 3000).join(" ");

        sendResponse({ title, url, content: truncated, wordCount: words.length });
    } catch (err) {
        sendResponse({ title: document.title || "", url: window.location.href, content: "", error: String(err) });
    }

    // Return true to keep the message channel open for the async sendResponse
    return true;
});
