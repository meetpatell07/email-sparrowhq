
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { drafts, emails, account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getGmailClient, applyGmailLabel } from "@/lib/gmail";
import { revalidatePath } from "next/cache";


import { processIngestion } from "@/lib/ingest";
import { classifyEmail } from "@/lib/ai";

export async function classifyIndividualEmail(gmailId: string, subject: string, snippet: string, receivedAt: Date) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // subject / snippet are used in-memory for classification only — never stored
    const existing = await db.select({ id: emails.id }).from(emails).where(eq(emails.gmailId, gmailId)).limit(1);

    let emailId: string;
    if (existing.length === 0) {
        const [inserted] = await db.insert(emails).values({
            userId: session.user.id,
            gmailId,
            receivedAt,
            isProcessed: false,
        }).returning({ id: emails.id });
        emailId = inserted.id;
    } else {
        emailId = existing[0].id;
    }

    const categories = await classifyEmail(subject, snippet);
    await db.update(emails).set({ categories, isProcessed: true }).where(eq(emails.id, emailId));

    // Apply Gmail labels in the background
    applyGmailLabel(session.user.id, gmailId, categories).catch(console.error);

    revalidatePath("/dashboard");
    return { success: true, categories };
}

// ... existing imports

export async function disconnectGmail(accountId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

    // Only clear tokens for the specific account row that belongs to this user
    await db.update(account)
        .set({
            accessToken: null,
            refreshToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            gmailHistoryId: null,
            gmailWatchExpiration: null,
        })
        .where(and(eq(account.id, accountId), eq(account.userId, session.user.id)));

    return { success: true };
}

export async function signOutAndClearTokens() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (session) {
        // Clear tokens from account table
        await db.update(account).set({
            accessToken: null,
            refreshToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
        }).where(eq(account.userId, session.user.id));
    }

    return { success: true };
}

export async function syncEmails() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const results = await processIngestion(session.user.id);
    revalidatePath("/dashboard");
    return { success: true, count: results.length };
}

export async function approveDraft(draftId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Fetch only what's needed — no content fields in schema
    const [item] = await db.select({
        gmailDraftId: drafts.gmailDraftId,
    })
        .from(drafts)
        .innerJoin(emails, eq(drafts.emailId, emails.id))
        .where(and(eq(drafts.id, draftId), eq(emails.userId, session.user.id)));

    if (!item) throw new Error("Draft not found");
    if (!item.gmailDraftId) throw new Error("No Gmail draft ID associated with this record");

    // Send the draft directly from Gmail — content, headers, and thread context are
    // already correct because createGmailDraft set them when the draft was created.
    const gmail = await getGmailClient(session.user.id);

    try {
        await gmail.users.drafts.send({
            userId: 'me',
            requestBody: { id: item.gmailDraftId },
        });

        await db.update(drafts).set({ status: 'sent' }).where(eq(drafts.id, draftId));
        revalidatePath("/dashboard");
        return { success: true };
    } catch (e) {
        console.error(e);
        throw new Error("Failed to send email");
    }
}

export async function discardDraft(draftId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // Verify ownership via join
    const exists = await db.select({ id: drafts.id })
        .from(drafts)
        .innerJoin(emails, eq(drafts.emailId, emails.id))
        .where(and(eq(drafts.id, draftId), eq(emails.userId, session.user.id)));

    if (exists.length === 0) throw new Error("Draft not found");

    // Delete the draft
    await db.delete(drafts).where(eq(drafts.id, draftId));
    revalidatePath("/dashboard/drafts");
    return { success: true };
}


