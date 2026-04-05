/**
 * content.js — Deep page crawler for the EmailHQ extension.
 * Injected into every page at document_idle.
 * Responds to { action: "getPageContent" } messages from the popup.
 */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action !== "getPageContent") return;

    try {
        const title = document.title || "";
        const url   = window.location.href;

        // ── Page metadata ─────────────────────────────────────────────────────
        const metaDesc =
            document.querySelector('meta[name="description"]')?.getAttribute("content") ||
            document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
            "";
        const ogTitle =
            document.querySelector('meta[property="og:title"]')?.getAttribute("content") || "";

        // ── Tags to strip completely (content + children) ─────────────────────
        const STRIP_TAGS = new Set([
            "script", "style", "noscript", "iframe", "svg", "canvas",
            "nav", "footer", "header", "aside",
        ]);

        // ── Attributes/classes that hint at noise ─────────────────────────────
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

        // ── Find best root content element ────────────────────────────────────
        const rootEl =
            document.querySelector("article") ||
            document.querySelector('[role="main"]') ||
            document.querySelector("main") ||
            document.querySelector(".post-content, .entry-content, .article-body, .job-description, .description, #job-details, #description, .content-body") ||
            document.querySelector("#content, .content, #main, .main") ||
            document.body;

        // ── Structured text extraction ────────────────────────────────────────
        // Walk the DOM in document order, pulling meaningful text with hierarchy.
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

            // Hard skip — don't recurse into noise subtrees
            if (STRIP_TAGS.has(tag) || isNoise(node)) return;

            if (BLOCK_TAGS.has(tag)) {
                const text = (node.innerText || node.textContent || "").replace(/\s+/g, " ").trim();
                if (!text) return;

                if (/^h[1-3]$/.test(tag)) {
                    // Headings get a blank line before/after for structure
                    lines.push("");
                    lines.push(text.toUpperCase() + ":");
                } else if (tag === "li") {
                    lines.push("• " + text);
                } else {
                    lines.push(text);
                }
            } else {
                // For container elements, recurse into children
                for (const child of node.children) {
                    walk(child);
                }
            }
        }

        walk(rootEl);

        // ── Assemble and deduplicate ──────────────────────────────────────────
        const seen = new Set();
        const deduped = [];
        for (const line of lines) {
            const key = line.trim();
            if (!key || seen.has(key)) continue;
            seen.add(key);
            deduped.push(line);
        }

        const bodyText = deduped.join("\n").trim();

        // ── Build final content block with metadata header ────────────────────
        const metaBlock = [
            ogTitle  ? `Page Title: ${ogTitle}`  : null,
            metaDesc ? `Description: ${metaDesc}` : null,
        ].filter(Boolean).join("\n");

        const fullContent = [metaBlock, bodyText].filter(Boolean).join("\n\n---\n\n");

        // Truncate to 5000 words (server will further truncate if needed)
        const words = fullContent.split(/\s+/).filter(Boolean);
        const truncated = words.slice(0, 5000).join(" ");

        sendResponse({
            title,
            url,
            content:   truncated,
            wordCount: words.length,
            metaDesc,
        });
    } catch (err) {
        sendResponse({
            title:   document.title || "",
            url:     window.location.href,
            content: "",
            error:   String(err),
        });
    }

    return true; // keep channel open for async sendResponse
});
