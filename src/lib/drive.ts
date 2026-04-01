import { google } from "googleapis";
import { db } from "./db";
import { account } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "./encryption";

export async function getGoogleDriveClient(userId: string) {
    const records = await db.select().from(account).where(and(eq(account.userId, userId), eq(account.providerId, 'google'))).limit(1);

    if (records.length === 0) {
        throw new Error("User has no Google account linked");
    }

    const { accessToken, refreshToken: rawRefreshToken } = records[0];
    
    if (!rawRefreshToken) {
        throw new Error("Missing refresh token");
    }

    let refreshToken = rawRefreshToken;
    try {
        if (refreshToken.includes(":")) {
            refreshToken = await decrypt(refreshToken);
        }
    } catch {
        // ignore, might be plain text
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function fetchRecentDriveFiles(userId: string) {
    const drive = await getGoogleDriveClient(userId);

    const response = await drive.files.list({
        pageSize: 20,
        fields: "nextPageToken, files(id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime, iconLink)",
        orderBy: "modifiedTime desc",
        q: "trashed=false"
    });

    return response.data.files || [];
}

export async function getDriveFileContext(userId: string, fileId: string): Promise<string> {
    const drive = await getGoogleDriveClient(userId);
    
    // Check mimetype to see what it is
    const file = await drive.files.get({ fileId, fields: "mimeType, name" });
    const mimeType = file.data.mimeType || "";

    try {
        if (mimeType.includes("google-apps.document")) {
            const res = await drive.files.export({ fileId, mimeType: "text/plain" });
            return res.data as string;
        } else if (mimeType.includes("google-apps.spreadsheet")) {
            const res = await drive.files.export({ fileId, mimeType: "text/csv" });
            return res.data as string;
        } else if (mimeType.includes("google-apps.presentation")) {
            const res = await drive.files.export({ fileId, mimeType: "text/plain" });
            return res.data as string;
        } else if (mimeType === "text/plain") {
            const res = await drive.files.get({ fileId, alt: "media" });
            return res.data as string;
        }
    } catch (e) {
        console.error("Failed to read context from drive file", e);
    }

    return "No readable textual context available from the selected file.";
}
