
import { NextResponse } from "next/server";
import { processIngestion } from "@/lib/ingest";

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const results = await processIngestion();
    return NextResponse.json({ success: true, processed: results.length });
}
