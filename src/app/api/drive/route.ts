import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ error: "Drive integration has been removed" }, { status: 410 });
}
