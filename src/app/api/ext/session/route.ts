import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Thin session wrapper for the Chrome extension.
// Better Auth's default session endpoint doesn't emit CORS headers for
// chrome-extension:// origins, so we proxy it here with the correct headers.

function corsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get("origin") ?? "";
    if (!origin.startsWith("chrome-extension://")) return {};
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

export async function OPTIONS(request: Request) {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request) {
    const cors = corsHeaders(request);
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        return NextResponse.json({ user: null }, { status: 401, headers: cors });
    }

    return NextResponse.json(
        {
            user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                image: session.user.image,
            },
        },
        { headers: cors }
    );
}
