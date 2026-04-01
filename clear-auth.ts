import { config } from "dotenv";
config();

import { db } from "./src/lib/db";
import { session, account, user } from "./src/lib/db/schema";
import { sql } from "drizzle-orm";

async function clearAuth() {
    try {
        console.log("Clearing all sessions and OAuth accounts to force a strict fresh login...");
        
        // Delete sessions to invalidate login state
        await db.delete(session);
        console.log("Deleted sessions.");
        
        // Delete accounts so Google OAuth has to be requested fresh
        await db.delete(account);
        console.log("Deleted old OAuth accounts.");

        console.log("Database cleared successfully. User must sign in again.");
        process.exit(0);
    } catch (error) {
        console.error("Error clearing DB:", error);
        process.exit(1);
    }
}

clearAuth();
