"use client";

import type { InAppBrowserInfo } from "@/lib/google-oauth";

type InAppBrowserNoticeProps = {
    browser: InAppBrowserInfo;
    externalUrl: string;
    androidIntentUrl?: string | null;
    className?: string;
};

export function InAppBrowserNotice({
    browser,
    externalUrl,
    androidIntentUrl,
    className,
}: InAppBrowserNoticeProps) {
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(externalUrl);
        } catch (error) {
            console.error("Failed to copy login link:", error);
        }
    };

    const openHref = browser.isAndroid && androidIntentUrl ? androidIntentUrl : externalUrl;

    return (
        <div
            className={className}
            style={{
                border: "1px solid rgba(245, 158, 11, 0.35)",
                background: "rgba(120, 53, 15, 0.18)",
            }}
        >
            <p className="text-[13px] font-medium text-[#FDE68A]">
                Open this page in your browser to continue
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#F5F5F4]">
                {browser.instructions}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <a
                    href={openHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-[13px] font-medium text-[#0A0A0A]"
                    style={{ background: "#FDE68A" }}
                >
                    Open in browser
                </a>
                <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center rounded-lg border border-[#57534E] px-4 py-2 text-[13px] font-medium text-[#F5F5F4]"
                >
                    Copy link
                </button>
            </div>
        </div>
    );
}
