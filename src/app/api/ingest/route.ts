import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // Dynamic import defers evaluation to runtime where nodejs_compat is active
    const { processIngestion } = await import("@/lib/ingest");
    const results = await processIngestion();
    return NextResponse.json({ success: true, processed: results.length });
}
