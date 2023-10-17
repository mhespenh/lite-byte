export type WebSocketClearMessage = {
  command: "clear";
};

export type WebSocketSetMessage = {
  command: "set";
  x: number;
  y: number;
  color: PaletteColors;
};

export type WebSocketCommandMessage = {
  serial: string;
  message: WebSocketClearMessage | WebSocketSetMessage;
};

export const PALETTE_COLORS = {
  "#000": 0,
  "#f00": 1,
  "#00f": 2,
  "#0f0": 3,
  "#f0f": 4,
  "#0ff": 5,
  "#ff0": 6,
  "#fff": 7,
};
export type PaletteColors = keyof typeof PALETTE_COLORS;

export const isSetMessage = (
  message: WebSocketClearMessage | WebSocketSetMessage
): message is WebSocketSetMessage => message.command === "set";

export const isClearMessage = (
  message: WebSocketClearMessage | WebSocketSetMessage
): message is WebSocketClearMessage => message.command === "clear";
