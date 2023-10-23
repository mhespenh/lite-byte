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
export const isSetMessage = (message) => message.command === "set";
export const isClearMessage = (message) => message.command === "clear";
