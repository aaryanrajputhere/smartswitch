import mqtt from "mqtt";

const brokerUrl = process.env.MQTT_BROKER_URL!;
const username = process.env.MQTT_USERNAME!;
const password = process.env.MQTT_PASSWORD!;

// Connect securely with TLS
const client = mqtt.connect(brokerUrl, {
  username,
  password,
  protocol: "mqtts", // Important for TLS
  port: 8883,
  reconnectPeriod: 5000, // auto-reconnect
});

client.on("connect", () => {
  console.log("✅ Connected to HiveMQ Cloud");
});

client.on("error", (err) => {
  console.error("❌ MQTT Connection Error:", err);
});

export default client;
