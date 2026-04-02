import { NextResponse } from "next/server";
import { qstashReceiver } from "@/lib/qstash";
import { processSingleEmail } from "@/lib/ingest";

export async function POST(req: Request) {
    // Verify the request genuinely comes from QStash
    const signature = req.headers.get("upstash-signature") ?? "";
    const body = await req.text();

    const isValid = await qstashReceiver.verify({ signature, body });
    if (!isValid) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let payload: { userId: string; messageId: string };
    try {
        payload = JSON.parse(body);
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { userId, messageId } = payload;
    if (!userId || !messageId) {
        return NextResponse.json({ error: "Missing userId or messageId" }, { status: 400 });
    }

    const result = await processSingleEmail(userId, messageId);

    return NextResponse.json({ success: true, result });
}
