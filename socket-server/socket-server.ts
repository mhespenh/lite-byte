import "dotenv/config";

import { readFileSync } from "fs";
import { createServer } from "https";
import { connect } from "mqtt";
import { WebSocketServer } from "ws";
import { validateToken } from "./token-validate.js";
import {
  PALETTE_COLORS,
  WebSocketCommandMessage,
  isClearMessage,
  isSetMessage,
} from "./websocket-message.js";

const WEBSOCKET_PORT = 8443;
const VERBOSE = process.env.VERBOSE === "true";

let server: undefined | ReturnType<typeof createServer>;
let port: undefined | number;

if (process.env.NODE_ENV === "production") {
  server = createServer({
    cert: readFileSync("socket-server-cert.pem"),
    key: readFileSync("socket-server-key.pem"),
  });
} else {
  port = WEBSOCKET_PORT;
}

const webSocketServer = new WebSocketServer({ server, port });

const global_mqtt = connect(`mqtt://${process.env.MQTT_HOST}`, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

console.log("Connecting to MQTT");
global_mqtt.on("connect", () => {
  console.log("Connected to MQTT");
  // Subscribe to all ${serial}/status topics
  global_mqtt.subscribe(`+/status`);
});

// Anytime we recieve an MQTT message
global_mqtt.on("message", (topic, message) => {
  console.log(`MQTT message received on ${topic}: ${message.toString()}`);
  if (topic.includes("/status") && message.toString() === "online") {
    const [serial] = topic.split("/status");
    fetch(`${process.env.SOCKET_SERVER_API_URL}/api/heartbeat`, {
      method: "PATCH",
      body: JSON.stringify({ serial }),
    });
  }
});

webSocketServer.on("connection", async (webSocketClientConnection, request) => {
  // Pull token out of cookie
  const token = request.headers.cookie?.split("=")[1];
  if (!token) {
    webSocketClientConnection.close(4401, "Authorization Required");
    return;
  }

  // Validate token
  const decodedToken = await validateToken(token);
  if (!decodedToken) {
    webSocketClientConnection.close(4403, "Unauthorized");
    return;
  }

  // Connect to the MQTT broker for communication with the litebyte devices
  const mqtt_client = connect(`mqtt://${process.env.MQTT_HOST}`, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  });

  // Anytime we recieve an MQTT message
  mqtt_client.on("message", (topic, message) => {
    // We will be subscribed to a specific device's status topic (e.g.: 1234567890/status)
    // But we don't know the serial number of the device until the user sends a message
    // So just check to see if _any_ status topic we're subscrived to sends an "offline" message
    if (topic.includes("/status") && message.toString() === "offline") {
      // When that happens, close the websocket connection
      webSocketClientConnection.close(4404, "Device not registered");
      return;
    }
  });

  webSocketClientConnection.on("error", console.error);

  webSocketClientConnection.on("message", async (data) => {
    VERBOSE && console.log("received from client: %s", data);
    const { serial, message } = JSON.parse(
      data.toString()
    ) as WebSocketCommandMessage;

    // Check to see if user is authorized to send messages to this device
    const device = decodedToken.devices?.find(
      (device) => device.serial === serial
    );
    if (!device) {
      webSocketClientConnection.close(4403, "Unauthorized");
      return;
    }

    // Subscribe to changes on the device status topic
    mqtt_client.subscribe(`${serial}/status`);

    if (isClearMessage(message)) {
      mqtt_client.publish(`${serial}/display.clear`, "");
    } else if (isSetMessage(message)) {
      const { x, y, color } = message;
      const paletteColor = PALETTE_COLORS[color];
      const formattedCommand = `${x},${y},${paletteColor}`;
      mqtt_client.publish(`${serial}/display.set`, formattedCommand);
    } else {
      console.error(`Unsupported message: "${message}"`);
      webSocketClientConnection.send(`Unsupported command: "${message}"`);
    }
  });
});

console.log(`Listening for WebSocket connections on ${WEBSOCKET_PORT}`);
server?.listen(WEBSOCKET_PORT);
