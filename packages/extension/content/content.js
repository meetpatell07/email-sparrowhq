/**
 * content.js — Deep page crawler for the SparrowHQ extension.
 * Injected into every page at document_idle.
 * Responds to:
 *   { action: "getPageContent" }  — full page text extraction
 *   { action: "getLinkedInContact" } — LinkedIn profile data extraction
 */

// ── LinkedIn contact extraction ───────────────────────────────────────────────

function extractLinkedInContact() {
    const isLinkedIn =
        window.location.hostname === "www.linkedin.com" &&
        window.location.pathname.startsWith("/in/");

    if (!isLinkedIn) return null;

    // Name — LinkedIn renders it in an h1 with class containing "text-heading-xlarge"
    const nameEl =
        document.querySelector("h1.text-heading-xlarge") ||
        document.querySelector("h1[class*='top-card-layout__title']") ||
        document.querySelector("h1");
    const name = nameEl?.innerText?.trim() ?? null;

    // Title / Headline — appears directly below name
    const titleEl =
        document.querySelector(".text-body-medium.break-words") ||
        document.querySelector("[class*='top-card-layout__headline']") ||
        document.querySelector(".pv-text-details__left-panel .text-body-medium");
    const title = titleEl?.innerText?.trim() ?? null;

    // Company — the current position in the experience section or the top card
    const companyEl =
        document.querySelector("[class*='top-card-layout__first-subline'] span:first-child") ||
        document.querySelector(".pv-text-details__left-panel .inline-show-more-text") ||
        document.querySelector("[aria-label*='Current company']");
    const company = companyEl?.innerText?.trim() ?? null;

    // Email — LinkedIn rarely exposes this publicly; check the contact info modal
    // if already open. We capture it if visible in the DOM.
    const emailLink = document.querySelector("a[href^='mailto:']");
    const email = emailLink
        ? emailLink.getAttribute("href")?.replace("mailto:", "").trim() ?? null
        : null;

    if (!name) return null;

    return { name, title, company, email, profileUrl: window.location.href };
}

// ── Page content extraction ───────────────────────────────────────────────────

function extractPageContent() {
    const title = document.title || "";
    const url   = window.location.href;

    // Page metadata
    const metaDesc =
        document.querySelector('meta[name="description"]')?.getAttribute("content") ||
        document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
        "";
    const ogTitle =
        document.querySelector('meta[property="og:title"]')?.getAttribute("content") || "";

    const STRIP_TAGS = new Set([
        "script", "style", "noscript", "iframe", "svg", "canvas",
        "nav", "footer", "header", "aside",
    ]);

    const NOISE_PATTERNS = [
        /\b(nav|navbar|navigation|breadcrumb|sidebar|footer|cookie|banner|popup|modal|overlay|ad|ads|advertisement|promo|social|share|related|recommend|comment|newsletter|subscribe)\b/i,
    ];

    function isNoise(el) {
        const role = el.getAttribute("role") || "";
        if (["navigation", "banner", "complementary", "contentinfo"].includes(role)) return true;
        const cls = (el.className || "").toString();
        const id  = (el.id || "").toString();
        return NOISE_PATTERNS.some((re) => re.test(cls) || re.test(id));
    }

    const rootEl =
        document.querySelector("article") ||
        document.querySelector('[role="main"]') ||
        document.querySelector("main") ||
        document.querySelector(".post-content, .entry-content, .article-body, .job-description, .description, #job-details, #description, .content-body") ||
        document.querySelector("#content, .content, #main, .main") ||
        document.body;

    const BLOCK_TAGS = new Set([
        "h1","h2","h3","h4","h5","h6",
        "p","li","dt","dd","blockquote","figcaption",
        "td","th","caption",
        "label","summary","details",
    ]);

    const lines = [];

    function walk(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const tag = node.tagName.toLowerCase();
        if (STRIP_TAGS.has(tag) || isNoise(node)) return;

        if (BLOCK_TAGS.has(tag)) {
            const text = (node.innerText || node.textContent || "").replace(/\s+/g, " ").trim();
            if (!text) return;
            if (/^h[1-3]$/.test(tag)) {
                lines.push("");
                lines.push(text.toUpperCase() + ":");
            } else if (tag === "li") {
                lines.push("• " + text);
            } else {
                lines.push(text);
            }
        } else {
            for (const child of node.children) {
                walk(child);
            }
        }
    }

    walk(rootEl);

    const seen = new Set();
    const deduped = [];
    for (const line of lines) {
        const key = line.trim();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        deduped.push(line);
    }

    const bodyText = deduped.join("\n").trim();
    const metaBlock = [
        ogTitle  ? `Page Title: ${ogTitle}`   : null,
        metaDesc ? `Description: ${metaDesc}` : null,
    ].filter(Boolean).join("\n");

    const fullContent = [metaBlock, bodyText].filter(Boolean).join("\n\n---\n\n");
    const words = fullContent.split(/\s+/).filter(Boolean);
    const truncated = words.slice(0, 5000).join(" ");

    return { title, url, content: truncated, wordCount: words.length, metaDesc };
}

// ── Message router ────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    try {
        if (message.action === "getPageContent") {
            sendResponse(extractPageContent());
            return true;
        }

        if (message.action === "getLinkedInContact") {
            const contact = extractLinkedInContact();
            sendResponse({ contact });
            return true;
        }
    } catch (err) {
        sendResponse({
            title:   document.title || "",
            url:     window.location.href,
            content: "",
            error:   String(err),
        });
    }

    return true;
});
