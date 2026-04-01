import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getDriveFileContext, getGoogleDriveClient } from "@/lib/drive";
import { generateDraftFromFile } from "@/lib/ai";
import { createGmailDraft } from "@/lib/gmail";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { fileId, instructions, recipient } = await req.json();

        if (!fileId || !instructions || !recipient) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userId = session.user.id;
        const fileContext = await getDriveFileContext(userId, fileId);

        const drive = await getGoogleDriveClient(userId);
        const fileMeta = await drive.files.get({ fileId, fields: "name, webViewLink" });
        const fileName = fileMeta.data.name || "Attached Document";
        const fileLink = fileMeta.data.webViewLink || "";

        const generatedBody = await generateDraftFromFile(fileContext, instructions, recipient);
        const finalBody = `${generatedBody}\n\n---\nDocument: ${fileName}\nAccess Link: ${fileLink}`;
        const subject = `Sharing Document: ${fileName}`;
        
        const draftId = await createGmailDraft(userId, recipient, subject, finalBody);
        return NextResponse.json({ draftId, message: "Draft successfully created!" });
    } catch (error) {
        console.error("Error creating AI draft from file:", error);
        return NextResponse.json({ error: "Failed to create draft" }, { status: 500 });
    }
}
