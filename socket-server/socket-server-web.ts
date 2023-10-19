import "dotenv/config";
import { readFileSync } from "fs";
import { createServer } from "https";
import { Socket } from "net";
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

export const createWebSocketServer = (deviceSocketMap: Map<string, Socket>) => {
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

  webSocketServer.on(
    "connection",
    async (webSocketClientConnection, request) => {
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

      const someDeviceOnline = decodedToken.devices?.some(({ serial }) =>
        deviceSocketMap.has(serial)
      );
      if (!someDeviceOnline) {
        webSocketClientConnection.close(4404, "Device not registered");
        return;
      }

      webSocketClientConnection.on("error", console.error);

      webSocketClientConnection.on("message", (data) => {
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

        // Check to see if we've got a registered device listening for messages
        const deviceSocket = deviceSocketMap.get(device.serial);
        if (!deviceSocket) {
          webSocketClientConnection.close(4404, "Device not registered");
          return;
        }

        if (isClearMessage(message)) {
          deviceSocket.write(Buffer.from("clear:\n"));
        } else if (isSetMessage(message)) {
          const { x, y, color } = message;
          const paletteColor = PALETTE_COLORS[color];
          const formattedCommand = `set:${x},${y},${paletteColor}\n`;
          deviceSocket.write(Buffer.from(formattedCommand));
        } else {
          console.error(`Unsupported message: "${message}"`);
          webSocketClientConnection.send(`Unsupported command: "${message}"`);
        }
      });
    }
  );

  console.log(`Listening for WebSocket connections on ${WEBSOCKET_PORT}`);
  server?.listen(WEBSOCKET_PORT);
};
