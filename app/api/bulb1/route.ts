// /api/bulb1/route.ts
import { NextResponse } from "next/server";

let bulbState = "SW01-OFF"; // default state (matches ESP32 format)

export async function GET() {
  // Return plain text response (not JSON)
  return new Response(bulbState, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, state } = body as { id?: string; state?: string };

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (state !== "ON" && state !== "OFF") {
      return NextResponse.json(
        { error: "Invalid state, must be ON or OFF" },
        { status: 400 }
      );
    }

    // sanitize id to alphanumeric uppercase fragment
    const cleanedId = id.replace(/[^a-z0-9]/gi, "").toUpperCase() || "SW";
    const composite = `${cleanedId}-${state}`; // use hyphen instead of underscore
    bulbState = composite;

    console.log("✅ Updated bulb state:", bulbState);

    return NextResponse.json({ ok: true, state: composite });
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
