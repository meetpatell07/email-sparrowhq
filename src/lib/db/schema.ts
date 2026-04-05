
import { pgTable, text, timestamp, boolean, uuid, decimal, jsonb, integer } from "drizzle-orm/pg-core";

// --- Better Auth Schema ---
export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId").notNull().references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId").notNull().references(() => user.id),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    gmailHistoryId: text("gmail_history_id"),
    gmailWatchExpiration: timestamp("gmail_watch_expiration"),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt"),
});

// --- App Schema ---

export const emails = pgTable("emails", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("userId").notNull().references(() => user.id),
    gmailId: text("gmailId").notNull().unique(),
    threadId: text("threadId"),
    // No subject / snippet / sender / recipient — email content is never persisted.
    // All display data is fetched live from Gmail API (cached in Redis).
    receivedAt: timestamp("receivedAt").notNull(),
    categories: text("categories").array(), // AI classification result — derived, not raw content
    isProcessed: boolean("isProcessed").default(false),
    createdAt: timestamp("createdAt").defaultNow(),
});

export const attachments = pgTable("attachments", {
    id: uuid("id").defaultRandom().primaryKey(),
    emailId: uuid("emailId").notNull().references(() => emails.id, { onDelete: 'cascade' }),
    filename: text("filename").notNull(),
    contentType: text("contentType"),
    size: integer("size"),
    r2Key: text("r2Key").notNull(), // Path in R2
    driveFileId: text("driveFileId"), // Set when saved to Google Drive
    driveWebViewLink: text("driveWebViewLink"), // Direct link to Drive file
    createdAt: timestamp("createdAt").defaultNow(),
});

export const invoices = pgTable("invoices", {
    id: uuid("id").defaultRandom().primaryKey(),
    emailId: uuid("emailId").notNull().references(() => emails.id, { onDelete: 'cascade' }),
    vendorName: text("vendorName"),
    amount: decimal("amount", { precision: 10, scale: 2 }),
    currency: text("currency").default("USD"),
    dueDate: timestamp("dueDate"),
    status: text("status").default("pending"), // pending, paid
    extractedData: jsonb("extractedData"), // Full AI JSON
    createdAt: timestamp("createdAt").defaultNow(),
});

export const drafts = pgTable("drafts", {
    id: uuid("id").defaultRandom().primaryKey(),
    emailId: uuid("emailId").notNull().references(() => emails.id, { onDelete: 'cascade' }),
    gmailDraftId: text("gmailDraftId"), // ID of the draft in Gmail — content fetched live from Gmail API
    // No content column — draft body lives exclusively in Gmail Drafts.
    status: text("status").default("pending_approval"), // pending_approval, approved, sent, rejected
    createdAt: timestamp("createdAt").defaultNow(),
});
