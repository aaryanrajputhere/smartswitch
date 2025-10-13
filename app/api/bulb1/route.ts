// /api/bulb1/route.ts
import { NextResponse } from "next/server";

let bulbState = "OFF"; // initial state

export async function GET() {
  // Returns JSON string: "ON" or "OFF"
  return NextResponse.json(bulbState);
}

export async function POST(req: Request) {
  const { state } = await req.json();
  if (state !== "ON" && state !== "OFF") {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  bulbState = state;
  return NextResponse.json({ ok: true, state });
}
