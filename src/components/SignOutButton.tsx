"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { signOutAndClearTokens } from "@/app/actions";
import { useState } from "react";

export function SignOutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        // Run token cleanup and session sign-out in parallel — no need to wait for
        // the DB write before ending the session.
        await Promise.all([
            signOutAndClearTokens().catch(console.error),
            signOut({ fetchOptions: { onSuccess: () => router.push("/") } }),
        ]);
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-[13px] font-medium text-[#DC2626] hover:bg-[#FEE2E2] transition-colors disabled:opacity-60"
        >
            {loading
                ? <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin shrink-0" />
                : <HugeiconsIcon icon={Logout01Icon} size={15} className="shrink-0" />
            }
            {loading ? "Signing out…" : "Sign out"}
        </button>
    );
}
