"use client";

import useSWR from "swr";
import { DashboardLayout } from "@/components/DashboardLayout";
import { authClient } from "@/lib/auth-client";
import { SignOutButton } from "@/components/SignOutButton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Mail01Icon,
    CheckmarkCircle01Icon,
    AlertCircleIcon,
    Loading03Icon,
    UserCircleIcon,
    LinkSquare01Icon,
    Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { RefreshCw } from "lucide-react";
import { disconnectGmail } from "@/app/actions";
import { formatDistanceToNow, isPast } from "date-fns";
import { useState } from "react";

interface Connection {
    id: string;
    accountId: string;
    providerId: string;
    scope: string | null;
    isConnected: boolean;
    accessTokenExpiresAt: string | null;
    gmailWatchExpiration: string | null;
    gmailHistoryId: string | null;
    createdAt: string;
    updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function ScopeList({ scope }: { scope: string | null }) {
    if (!scope) return <span className="text-[12px] text-[#A8A29E]">No scopes recorded</span>;

    const friendly: Record<string, string> = {
        "https://www.googleapis.com/auth/gmail.readonly": "Read emails",
        "https://www.googleapis.com/auth/gmail.compose": "Compose emails",
        "https://www.googleapis.com/auth/gmail.modify": "Modify emails & labels",
        "https://www.googleapis.com/auth/calendar.readonly": "Read calendar",
        "https://www.googleapis.com/auth/calendar.events": "Manage calendar events",
        "https://www.googleapis.com/auth/drive.readonly": "Read Drive files",
        "https://www.googleapis.com/auth/drive.file": "Access Drive files",
        "openid": "Identity",
        "email": "Email address",
        "profile": "Profile info",
    };

    const scopes = scope.split(/\s+/).filter(Boolean);
    const important = scopes.filter((s) => s.includes("googleapis"));

    return (
        <div className="flex flex-wrap gap-1.5 mt-2">
            {important.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[11px] font-medium text-[#16A34A]">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={11} />
                    {friendly[s] ?? s.split("/").pop()}
                </span>
            ))}
        </div>
    );
}

function ConnectionCard({ conn, onReconnect, reconnecting, onDisconnected }: {
    conn: Connection;
    onReconnect: () => void;
    reconnecting: boolean;
    onDisconnected: () => void;
}) {
    const [disconnecting, setDisconnecting] = useState(false);
    const [confirmDisconnect, setConfirmDisconnect] = useState(false);

    const tokenExpired = conn.accessTokenExpiresAt
        ? isPast(new Date(conn.accessTokenExpiresAt))
        : false;

    const watchExpired = conn.gmailWatchExpiration
        ? isPast(new Date(conn.gmailWatchExpiration))
        : true;

    const isHealthy = conn.isConnected && !tokenExpired;

    const handleDisconnect = async () => {
        setDisconnecting(true);
        try {
            await disconnectGmail(conn.id);
            onDisconnected();
        } catch (e) {
            console.error("Disconnect failed:", e);
        } finally {
            setDisconnecting(false);
            setConfirmDisconnect(false);
        }
    };

    return (
        <div className="bg-white border border-[#E7E5E4] rounded-lg overflow-hidden">
            {/* Provider header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E5E4]">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F5F5F4] flex items-center justify-center">
                        <span className="text-[15px] font-bold text-[#4285F4]">G</span>
                    </div>
                    <div>
                        <p className="text-[14px] font-semibold text-[#1C1917]">Google</p>
                        <p className="text-[12px] text-[#78716C] font-mono">{conn.accountId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isHealthy ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[12px] font-medium text-[#059669]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                            Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF2F2] text-[12px] font-medium text-[#DC2626]">
                            <HugeiconsIcon icon={AlertCircleIcon} size={12} />
                            {conn.isConnected ? "Token expired" : "Disconnected"}
                        </span>
                    )}
                </div>
            </div>

            {/* Details */}
            <div className="px-5 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                    <div>
                        <p className="text-[#A8A29E] font-medium uppercase tracking-wider text-[10px] mb-1">Connected</p>
                        <p className="text-[#57534E]">
                            {formatDistanceToNow(new Date(conn.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                    <div>
                        <p className="text-[#A8A29E] font-medium uppercase tracking-wider text-[10px] mb-1">Last refreshed</p>
                        <p className="text-[#57534E]">
                            {formatDistanceToNow(new Date(conn.updatedAt), { addSuffix: true })}
                        </p>
                    </div>
                    <div>
                        <p className="text-[#A8A29E] font-medium uppercase tracking-wider text-[10px] mb-1">Gmail watch</p>
                        <p className={watchExpired ? "text-[#DC2626]" : "text-[#57534E]"}>
                            {conn.gmailWatchExpiration
                                ? (watchExpired
                                    ? "Expired — reconnect to restore"
                                    : `Expires ${formatDistanceToNow(new Date(conn.gmailWatchExpiration), { addSuffix: true })}`)
                                : "Not active"}
                        </p>
                    </div>
                    <div>
                        <p className="text-[#A8A29E] font-medium uppercase tracking-wider text-[10px] mb-1">History ID</p>
                        <p className="text-[#57534E] font-mono">{conn.gmailHistoryId ?? "—"}</p>
                    </div>
                </div>

                {/* Scopes */}
                <div>
                    <p className="text-[#A8A29E] font-medium uppercase tracking-wider text-[10px] mb-1">Granted permissions</p>
                    <ScopeList scope={conn.scope} />
                </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 border-t border-[#E7E5E4] bg-[#FAFAF9] flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12px] text-[#A8A29E]">
                    {isHealthy
                        ? "Reconnect to grant updated permissions or switch accounts."
                        : "Reconnect to restore email ingestion and label sync."}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                    {/* Disconnect */}
                    {confirmDisconnect ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-[#DC2626]">Remove tokens?</span>
                            <button
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[12px] font-medium text-[#DC2626] hover:bg-[#FEE2E2] transition-colors disabled:opacity-60"
                            >
                                {disconnecting
                                    ? <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin" />
                                    : <HugeiconsIcon icon={Cancel01Icon} size={13} />
                                }
                                {disconnecting ? "Removing…" : "Confirm"}
                            </button>
                            <button
                                onClick={() => setConfirmDisconnect(false)}
                                className="text-[12px] text-[#78716C] hover:text-[#1C1917] transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmDisconnect(true)}
                            disabled={reconnecting || disconnecting}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E5E4] text-[12px] font-medium text-[#78716C] hover:border-[#FECACA] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={13} />
                            Disconnect
                        </button>
                    )}

                    {/* Reconnect */}
                    <button
                        onClick={onReconnect}
                        disabled={reconnecting || disconnecting}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C1917] text-[13px] font-medium text-white hover:bg-[#292524] transition-colors disabled:opacity-60"
                    >
                        {reconnecting
                            ? <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                            : <RefreshCw size={13} />
                        }
                        {reconnecting ? "Redirecting…" : "Reconnect"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { data: session } = authClient.useSession();
    const user = session?.user;

    const { data, isLoading, error, mutate } = useSWR<{ connections: Connection[] }>(
        "/api/settings/connections",
        fetcher
    );

    const [reconnecting, setReconnecting] = useState<string | null>(null);

    const handleReconnect = async (connId: string) => {
        setReconnecting(connId);
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard/settings",
        });
    };

    const googleConnections = (data?.connections ?? []).filter(
        (c) => c.providerId === "google"
    );

    return (
        <DashboardLayout>
            <div className="min-h-full pb-20">
                <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">

                    {/* ── Profile ─────────────────────────────────────────── */}
                    <section>
                        <h2 className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-widest mb-3">Profile</h2>
                        <div className="bg-white border border-[#E7E5E4] rounded-lg px-5 py-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F5F5F4] border border-[#E7E5E4] shrink-0">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <HugeiconsIcon icon={UserCircleIcon} size={24} className="text-[#78716C]" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[15px] font-semibold text-[#1C1917] truncate">{user?.name || "—"}</p>
                                <p className="text-[13px] text-[#78716C] truncate mt-0.5">{user?.email || "—"}</p>
                            </div>
                        </div>
                    </section>

                    {/* ── Connected accounts ──────────────────────────────── */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-widest">Connected accounts</h2>
                            <button
                                onClick={() => handleReconnect("new")}
                                disabled={!!reconnecting}
                                className="flex items-center gap-1.5 text-[12px] font-medium text-[#57534E] hover:text-[#1C1917] transition-colors disabled:opacity-50"
                            >
                                <HugeiconsIcon icon={LinkSquare01Icon} size={13} />
                                Add account
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="bg-white border border-[#E7E5E4] rounded-lg py-12 flex flex-col items-center gap-3">
                                <HugeiconsIcon icon={Loading03Icon} size={20} className="animate-spin text-[#A8A29E]" />
                                <p className="text-[13px] text-[#78716C]">Loading connections…</p>
                            </div>
                        ) : error ? (
                            <div className="bg-white border border-[#E7E5E4] rounded-lg py-10 text-center">
                                <p className="text-[13px] text-[#DC2626]">Failed to load connections.</p>
                            </div>
                        ) : googleConnections.length === 0 ? (
                            <div className="bg-white border border-[#E7E5E4] rounded-lg py-10 flex flex-col items-center gap-3">
                                <HugeiconsIcon icon={Mail01Icon} size={24} className="text-[#D4D0CE]" />
                                <p className="text-[13px] text-[#78716C]">No Google account connected.</p>
                                <button
                                    onClick={() => handleReconnect("new")}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C1917] text-[13px] font-medium text-white hover:bg-[#292524] transition-colors"
                                >
                                    <span className="font-bold text-white text-[13px]">G</span>
                                    Connect Google
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {googleConnections.map((conn) => (
                                    <ConnectionCard
                                        key={conn.id}
                                        conn={conn}
                                        onReconnect={() => handleReconnect(conn.id)}
                                        reconnecting={reconnecting === conn.id || reconnecting === "new"}
                                        onDisconnected={() => mutate()}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ── Danger zone ─────────────────────────────────────── */}
                    <section>
                        <h2 className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-widest mb-3">Session</h2>
                        <div className="bg-white border border-[#E7E5E4] rounded-lg px-5 py-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[14px] font-medium text-[#1C1917]">Sign out</p>
                                <p className="text-[12px] text-[#78716C] mt-0.5">Ends your session and clears stored tokens.</p>
                            </div>
                            <SignOutButton />
                        </div>
                    </section>

                </div>
            </div>
        </DashboardLayout>
    );
}
