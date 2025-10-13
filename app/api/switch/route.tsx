import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

async function getAllSwitches() {
  const switches = await prisma.switch.findMany();
  return switches;
}

export async function GET() {
  try {
    console.log("GET /api/switch called");
    const switches = await getAllSwitches();
    return NextResponse.json({ switches });
  } catch (err) {
    console.error("GET /api/switch error:", err);
    return NextResponse.json(
      { switches: [], ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    let { name, switchId } = body || {};

    if (!name && !switchId) {
      return NextResponse.json(
        { ok: false, error: "name or switchId required" },
        { status: 400 }
      );
    }

    if (typeof name === "string") name = name.trim();
    else name = undefined;

    if (typeof switchId === "string") {
      const cleaned = switchId.replace(/[^a-z0-9]/gi, "").toUpperCase();
      switchId = cleaned.length
        ? cleaned.startsWith("SW")
          ? cleaned
          : `SW${cleaned}`
        : undefined;
    } else {
      switchId = undefined;
    }

    try {
      const createData: any = { isOn: false };
      if (name) createData.name = name;
      if (switchId) createData.switchId = switchId;
      // ensure there's at least a name in DB (use switchId if name missing)
      if (!createData.name) createData.name = switchId ?? "";

      const created = await prisma.switch.create({ data: createData as any });
      return NextResponse.json({ ok: true, switch: created });
    } catch (err: any) {
      console.error("Prisma create error:", err);
      // Prisma unique constraint error code
      if (err.code === "P2002") {
        return NextResponse.json(
          { ok: false, error: "Unique constraint failed" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { ok: false, error: String(err) },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("POST /api/switch unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, isOn } = body;
    if (typeof id === "undefined") {
      return NextResponse.json(
        { ok: false, error: "Missing id" },
        { status: 400 }
      );
    }
    const updated = await prisma.switch.update({
      where: { id: Number(id) },
      data: { isOn: Boolean(isOn) },
    });

    // after DB update, notify the bulb1 route so in-memory bulb state reflects this change
    (async () => {
      try {
        const base =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.APP_URL ||
          "http://localhost:3000";
        const bulbId = updated.switchId ?? updated.name ?? `SW${updated.id}`;
        const stateStr = updated.isOn ? "ON" : "OFF";
        await fetch(`${base}/api/bulb1`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: bulbId, state: stateStr }),
        });
      } catch (e) {
        console.error("Failed to notify /api/bulb1:", e);
      }
    })();
    return NextResponse.json({ ok: true, switch: updated });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

