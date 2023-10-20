import "dotenv/config";
import { Socket } from "net";

import { createTcpSocketServer } from "./socket-server-tcp.js";
import { createWebSocketServer } from "./socket-server-web.js";

type DeviceSocket = {
  socket: Socket;
  lastContactedAt: Date;
};

export const deviceSocketMap = new Map<string, DeviceSocket>();
createTcpSocketServer();
createWebSocketServer();
