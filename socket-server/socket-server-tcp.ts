import "dotenv/config";
import { Socket, createServer } from "net";

const TCP_SOCKET_PORT = 8080;
const DEBUG = process.env.DEBUG === "true";
const VERBOSE = process.env.VERBOSE === "true";

export const createTcpSocketServer = (deviceSocketMap: Map<string, Socket>) => {
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
          deviceSocketMap.set(arg, socket);
          break;
        case "unregister":
          deviceSocketMap.delete(arg);
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
};
