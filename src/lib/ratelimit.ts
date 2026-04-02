import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Ingest cron: max 1 trigger per minute globally
export const ingestRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, "60 s"),
    prefix: "ratelimit:ingest",
});

// Chat endpoint: max 20 requests per minute per user
export const chatRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "ratelimit:chat",
});

// Groq AI calls: max 30 per minute per user
export const groqRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "60 s"),
    prefix: "ratelimit:groq",
});
