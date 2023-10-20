import "dotenv/config";
import { createServer } from "net";
import { deviceSocketMap } from "./socket-server.js";

const TCP_SOCKET_PORT = 8080;
// How often to ping active devices to ensure they are still connected
const PING_INTERVAL_SECONDS = 20;
// How long to wait for a response from a ping before considering the device disconnected
const PING_TIMEOUT_SECONDS = 60;
const DEBUG = process.env.DEBUG === "true";
const VERBOSE = process.env.VERBOSE === "true";

export const createTcpSocketServer = () => {
  let intervalHandle: NodeJS.Timeout | undefined;
  const tcpSocketServer = createServer((socket) => {
    let serial: string;
    DEBUG &&
      console.log(
        `Client connected: ${socket.remoteAddress}:${socket.remotePort}`
      );

    socket.on("data", (bufData) => {
      const message = bufData.toString();
      VERBOSE && console.log(`Data received from client: ${message}`);
      const [command, arg] = message.split(":");

      switch (command) {
        case "register":
          DEBUG && console.log(`Registering device ${arg}`);
          // In this case, arg will be the serial number of the device
          serial = arg;
          deviceSocketMap.set(arg, { socket, lastContactedAt: new Date() });
          restartHeartbeatService();
          break;
        case "unregister":
          deviceSocketMap.delete(arg);
          restartHeartbeatService();
          break;
        case "pong":
          deviceSocketMap.set(serial, {
            socket,
            lastContactedAt: new Date(),
          });
          fetch(`${process.env.SOCKET_SERVER_API_URL}/api/heartbeat`, {
            method: "PATCH",
            body: JSON.stringify({ serial }),
          });
          break;
        default:
          console.error(`Unsupported command: "${command}"`);
          break;
      }
    });

    socket.on("close", () => {
      DEBUG && console.log("onClose");
      deviceSocketMap.delete(serial);
    });
    socket.on("end", () => {
      DEBUG && console.log("onEnd");
      deviceSocketMap.delete(serial);
    });
    socket.on("error", (error) => {
      console.error(`Socket Error: ${error.message}`);
    });
  });

  tcpSocketServer.listen(TCP_SOCKET_PORT, () => {
    console.log(`Listening for TCP connections on ${TCP_SOCKET_PORT}`);
  });

  const restartHeartbeatService = () => {
    DEBUG && console.log("Restarting heartbeat service");
    clearInterval(intervalHandle);

    intervalHandle = setInterval(() => {
      deviceSocketMap.forEach(({ socket, lastContactedAt }, serial) => {
        const lastContactSeconds =
          (Date.now() - lastContactedAt.getTime()) / 1000;
        if (lastContactSeconds > PING_TIMEOUT_SECONDS) {
          DEBUG &&
            console.log(
              `Device ${serial} has not been heard from in ${lastContactSeconds} seconds. Closing connection.`
            );
          deviceSocketMap.delete(serial);
          restartHeartbeatService();
        }
        VERBOSE && console.log(`pinging ${serial}`);
        socket.write(Buffer.from("ping"));
      });
    }, 1000 * PING_INTERVAL_SECONDS);
  };
};
