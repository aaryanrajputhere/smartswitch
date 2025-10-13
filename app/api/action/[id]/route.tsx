import client from "@/lib/mqttClient";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { turnOn } = await req.json();

    if (typeof turnOn !== "boolean") {
      return Response.json({ error: "Missing or invalid 'turnOn' value." }, { status: 400 });
    }

    const topic = `switch/${id}/control`;
    const message = JSON.stringify({
      switchId: id,
      command: turnOn ? "ON" : "OFF",
      timestamp: new Date().toISOString(),
    });

    // publish message to MQTT broker
    await new Promise<void>((resolve, reject) => {
      client.publish(topic, message, { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return Response.json({
      success: true,
      message: `Command '${turnOn ? "ON" : "OFF"}' sent to switch ${id}`,
    });
  } catch (error) {
    console.error("MQTT publish error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
