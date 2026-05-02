import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export type AuditAction =
    | "email_classified"
    | "draft_created"
    | "draft_skipped_ai_gate"
    | "draft_skipped_thread_exists"
    | "draft_skipped_self_sender"
    | "invoice_extracted"
    | "label_applied"
    | "draft_approved"
    | "draft_rejected"
    | "email_marked_read"
    | "draft_failed";

export async function logAudit(
    userId: string,
    action: AuditAction,
    gmailMessageId?: string | null,
    metadata?: Record<string, unknown>
): Promise<void> {
    try {
        await db.insert(auditLogs).values({
            userId,
            action,
            gmailMessageId: gmailMessageId ?? null,
            metadata: metadata ?? null,
        });
    } catch (err) {
        // Audit log failures must never break the main pipeline
        console.error("[audit] Failed to write log entry:", err);
    }
}
