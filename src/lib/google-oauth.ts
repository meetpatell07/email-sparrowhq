"use client";

import { signIn } from "@/lib/auth-client";

type InAppBrowserRule = {
    name: string;
    patterns: RegExp[];
};

export type InAppBrowserInfo = {
    isInAppBrowser: boolean;
    appName: string | null;
    userAgent: string;
    isIOS: boolean;
    isAndroid: boolean;
    instructions: string | null;
};

export type GoogleSignInAttempt =
    | { ok: true }
    | {
        ok: false;
        reason: "in_app_browser";
        browser: InAppBrowserInfo;
        externalUrl: string;
        androidIntentUrl: string | null;
    };

const IN_APP_BROWSER_RULES: InAppBrowserRule[] = [
    { name: "Instagram", patterns: [/Instagram/i] },
    { name: "Facebook", patterns: [/FBAN/i, /FBAV/i, /FB_IAB/i, /MessengerForiOS/i, /Messenger/i] },
    { name: "LinkedIn", patterns: [/LinkedInApp/i, /LinkedIn/i] },
    { name: "TikTok", patterns: [/TikTok/i, /BytedanceWebview/i] },
    { name: "X", patterns: [/Twitter/i] },
    { name: "Pinterest", patterns: [/Pinterest/i] },
    { name: "Snapchat", patterns: [/Snapchat/i] },
    { name: "LINE", patterns: [/Line/i] },
    { name: "WeChat", patterns: [/MicroMessenger/i] },
];

function getInAppBrowserInstructions(browser: InAppBrowserInfo) {
    const browserLabel = browser.appName ?? "this in-app browser";

    if (browser.isIOS) {
        return `Google Sign-In is blocked inside ${browserLabel}. Use the app menu and choose "Open in Safari" to continue.`;
    }

    if (browser.isAndroid) {
        return `Google Sign-In is blocked inside ${browserLabel}. Open this page in Chrome or your default browser to continue.`;
    }

    return `Google Sign-In is blocked inside ${browserLabel}. Open this page in your default browser to continue.`;
}

export function detectInAppBrowser(userAgent: string): InAppBrowserInfo {
    const ua = userAgent ?? "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    const matchedRule = IN_APP_BROWSER_RULES.find((rule) =>
        rule.patterns.some((pattern) => pattern.test(ua))
    );

    const genericWebView =
        (isAndroid && (/\bwv\b/i.test(ua) || /; wv\)/i.test(ua))) ||
        (isIOS &&
            /AppleWebKit/i.test(ua) &&
            !/Safari/i.test(ua) &&
            !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua));

    const isInAppBrowser = Boolean(matchedRule) || genericWebView;
    const appName = matchedRule?.name ?? (genericWebView ? "embedded browser" : null);

    return {
        isInAppBrowser,
        appName,
        userAgent: ua,
        isIOS,
        isAndroid,
        instructions: isInAppBrowser
            ? getInAppBrowserInstructions({
                isInAppBrowser,
                appName,
                userAgent: ua,
                isIOS,
                isAndroid,
                instructions: null,
            })
            : null,
    };
}

export function getExternalBrowserUrl(currentUrl?: string) {
    if (typeof window === "undefined") {
        return currentUrl ?? "";
    }

    return currentUrl ?? window.location.href;
}

export function buildAndroidIntentUrl(url: string) {
    try {
        const parsed = new URL(url);

        if (parsed.protocol !== "https:") {
            return null;
        }

        return `intent://${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}#Intent;scheme=https;package=com.android.chrome;end`;
    } catch {
        return null;
    }
}

export async function beginGoogleSignIn(callbackURL: string): Promise<GoogleSignInAttempt> {
    if (typeof window === "undefined") {
        await signIn.social({ provider: "google", callbackURL });
        return { ok: true };
    }

    const browser = detectInAppBrowser(window.navigator.userAgent);

    if (browser.isInAppBrowser) {
        const externalUrl = getExternalBrowserUrl(window.location.href);

        return {
            ok: false,
            reason: "in_app_browser",
            browser,
            externalUrl,
            androidIntentUrl: browser.isAndroid ? buildAndroidIntentUrl(externalUrl) : null,
        };
    }

    await signIn.social({
        provider: "google",
        callbackURL,
    });

    return { ok: true };
}
