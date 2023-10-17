import "dotenv/config";
import { Socket } from "net";

import { createTcpSocketServer } from "./socket-server-tcp.js";
import { createWebSocketServer } from "./socket-server-web.js";

export const deviceSocketMap = new Map<string, Socket>();
createTcpSocketServer(deviceSocketMap);
createWebSocketServer(deviceSocketMap);
