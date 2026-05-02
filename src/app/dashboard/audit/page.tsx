import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AuditLogTab } from "@/components/AuditLogTab";

const TRUST_LOG_EMAILS = new Set(
    (process.env.TRUST_LOG_EMAILS ?? "meetpatel7026@gmail.com")
        .split(",")
        .map((e) => e.trim().toLowerCase())
);

export default async function AuditPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !TRUST_LOG_EMAILS.has(session.user.email.toLowerCase())) {
        redirect("/dashboard");
    }

    return <AuditLogTab />;
}
