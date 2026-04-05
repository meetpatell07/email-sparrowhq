/**
 * service_worker.js — EmailHQ extension background service worker.
 * Handles install events and acts as message relay if needed.
 */

const ONBOARDING_URL = "https://email.sparrowhq.co";

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({ url: ONBOARDING_URL });
    }
});
