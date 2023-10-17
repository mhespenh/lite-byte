import { WebSocketCommandMessage } from "@/util/typeguards/websocket-message";
import { useCallback, useEffect, useRef, useState } from "react";

export const useWebSocket = () => {
  const webSocket = useRef<WebSocket>();
  const [isConnected, setIsConnected] = useState(false);

  const createWebSocketClient = useCallback(() => {
    webSocket.current = new WebSocket(
      process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL ?? "ws://localhost:8443"
    );

    webSocket.current.onerror = (e) => console.error(e);
    webSocket.current.onopen = (e) => {
      console.log(`Connected to websocket server`, e);
      setIsConnected(true);
    };
    webSocket.current.onclose = ({ code, reason }) => {
      console.log(code, reason);
      setIsConnected(false);
    };
  }, []);

  const send = useCallback((message: WebSocketCommandMessage) => {
    webSocket.current?.send(JSON.stringify(message));
  }, []);

  // Connect automatically on mount
  useEffect(() => {
    createWebSocketClient();
    return () => webSocket.current?.close();
  }, [createWebSocketClient]);

  return {
    webSocket: webSocket.current,
    isConnected,
    reconnect: createWebSocketClient,
    send,
  };
};
