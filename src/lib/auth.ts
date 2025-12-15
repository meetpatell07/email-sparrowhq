
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
            if (data.refreshToken) {
                try {
                    data.refreshToken = encrypt(data.refreshToken);
                } catch (e) {
                    console.error("Encryption failed", e);
                }
            }
            return adapter.createAccount(data);
        },
        updateAccount: async (data: any) => {
            if (data.refreshToken) {
                try {
                    data.refreshToken = encrypt(data.refreshToken);
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
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            scope: [
                "email",
                "profile",
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/gmail.compose", // For drafts
                // "https://www.googleapis.com/auth/gmail.modify"? Drafts creation usually needs compose.
                // Instruction says: "Reads incoming emails", "Drafts replies", "Connects to user's Gmail".
                // We need offline access to get refresh token.
            ],
            accessType: "offline",
        },
    },
    // We might need hooks to encrypt the refresh token if Better Auth doesn't support it natively.
    // For now, we'll store it as is, and the "Encrypt refresh tokens" requirement 
    // might need a custom plugin or manual handling if strictly enforced at the adapter level.
    // TODO: Implement token encryption hook.
});
