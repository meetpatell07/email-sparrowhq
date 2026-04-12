
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { user, session, account, verification } from "./db/schema";

import { encrypt } from "./encryption";

const baseAdapterFactory = drizzleAdapter(db, {
    provider: "pg",
    schema: {
        user,
        session,
        account,
        verification
    }
});

const customAdapter = (options: any) => {
    const adapter = baseAdapterFactory(options) as any;
    return {
        ...adapter,
        createAccount: async (data: any) => {
            console.log("\n--- createAccount CALLED ---");
            console.log("Original account data:", { ...data, refreshToken: data.refreshToken ? "[REDACTED]" : undefined, accessToken: data.accessToken ? "[REDACTED]" : undefined });

            if (data.refreshToken) {
                try {
                    data.refreshToken = await encrypt(data.refreshToken);
                    console.log("Refresh token successfully encrypted");
                } catch (e) {
                    console.error("Encryption failed", e);
                }
            } else {
                console.log("WARNING: No refreshToken supplied by Google provider to createAccount");
            }

            if (!data.accessToken) {
                console.log("WARNING: No accessToken supplied by Google provider to createAccount");
            }

            return adapter.createAccount(data);
        },
        updateAccount: async (data: any) => {
            console.log("\n--- updateAccount CALLED ---");
            console.log("Updating account data:", { ...data, refreshToken: data.refreshToken ? "[REDACTED]" : undefined, accessToken: data.accessToken ? "[REDACTED]" : undefined });

            if (data.refreshToken) {
                try {
                    data.refreshToken = await encrypt(data.refreshToken);
                    console.log("Refresh token successfully encrypted on update");
                } catch (e) {
                    console.error("Encryption failed", e);
                }
            }
            return adapter.updateAccount(data);
        }
    };
};

export const auth = betterAuth({
    database: customAdapter,
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google", "microsoft"],
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            scope: [
                "email",
                "profile",
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/gmail.compose",
                "https://www.googleapis.com/auth/gmail.modify",
                "https://www.googleapis.com/auth/calendar.readonly",
                "https://www.googleapis.com/auth/calendar.events",
                "https://www.googleapis.com/auth/drive.readonly",
                "https://www.googleapis.com/auth/drive.file",
            ],
            accessType: "offline",
            prompt: "consent", // Force consent
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        },
        microsoft: {
            clientId: process.env.MICROSOFT_CLIENT_ID!,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
            tenantId: process.env.MICROSOFT_TENANT_ID ?? "common",
            scope: [
                "openid",
                "email",
                "profile",
                "offline_access",
                "Mail.Read",
                "Mail.ReadWrite",
                "Mail.Send",
                "Calendars.Read",
                "Calendars.ReadWrite",
                "Files.Read",
                "Files.ReadWrite",
            ],
        },
    },
    // We might need hooks to encrypt the refresh token if Better Auth doesn't support it natively.
    // For now, we'll store it as is, and the "Encrypt refresh tokens" requirement 
    // might need a custom plugin or manual handling if strictly enforced at the adapter level.
    // TODO: Implement token encryption hook.
});
