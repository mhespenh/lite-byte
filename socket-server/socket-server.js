var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "dotenv/config";
import { readFileSync } from "fs";
import { createServer } from "https";
import { connect } from "mqtt";
import { WebSocketServer } from "ws";
import { validateToken } from "./token-validate.js";
import { PALETTE_COLORS, isClearMessage, isSetMessage, } from "./websocket-message.js";
const WEBSOCKET_PORT = 8443;
const VERBOSE = process.env.VERBOSE === "true";
let server;
let port;
if (process.env.NODE_ENV === "production") {
    server = createServer({
        cert: readFileSync("socket-server-cert.pem"),
        key: readFileSync("socket-server-key.pem"),
    });
}
else {
    port = WEBSOCKET_PORT;
}
const webSocketServer = new WebSocketServer({ server, port });
const global_mqtt = connect(`mqtt://${process.env.MQTT_HOST}`, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: "global-mqtt",
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
webSocketServer.on("connection", (webSocketClientConnection, request) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Pull token out of cookie
    const token = (_a = request.headers.cookie) === null || _a === void 0 ? void 0 : _a.split("=")[1];
    if (!token) {
        webSocketClientConnection.close(4401, "Authorization Required");
        return;
    }
    // Validate token
    const decodedToken = yield validateToken(token);
    if (!decodedToken) {
        webSocketClientConnection.close(4403, "Unauthorized");
        return;
    }
    // Connect to the MQTT broker for communication with the litebyte devices
    const mqtt_client = connect(`mqtt://${process.env.MQTT_HOST}`, {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        clientId: `wss-${decodedToken.sub}}`,
    });
    // Subscribe to status topics for all devices the user is authorized to send messages to
    (_b = decodedToken.devices) === null || _b === void 0 ? void 0 : _b.map(({ serial }) => {
        mqtt_client.subscribe(`${serial}/status`);
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
    webSocketClientConnection.on("close", () => {
        mqtt_client.end();
    });
    webSocketClientConnection.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        VERBOSE && console.log("received from client: %s", data);
        const { serial, message } = JSON.parse(data.toString());
        // Check to see if user is authorized to send messages to this device
        const device = (_c = decodedToken.devices) === null || _c === void 0 ? void 0 : _c.find((device) => device.serial === serial);
        if (!device) {
            webSocketClientConnection.close(4403, "Unauthorized");
            return;
        }
        if (isClearMessage(message)) {
            mqtt_client.publish(`${serial}/display.clear`, "");
        }
        else if (isSetMessage(message)) {
            const { x, y, color } = message;
            const paletteColor = PALETTE_COLORS[color];
            const formattedCommand = `${x},${y},${paletteColor}`;
            mqtt_client.publish(`${serial}/display.set`, formattedCommand);
        }
        else {
            console.error(`Unsupported message: "${message}"`);
            webSocketClientConnection.send(`Unsupported command: "${message}"`);
        }
    }));
}));
console.log(`Listening for WebSocket connections on ${WEBSOCKET_PORT}`);
server === null || server === void 0 ? void 0 : server.listen(WEBSOCKET_PORT);
