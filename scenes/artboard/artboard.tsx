"use client";

import { Button } from "@/components/ui/button";
import { Canvas, Pixel } from "@/scenes/artboard/canvas";
import { ColorPicker } from "@/scenes/artboard/color-picker";
import { PaletteColors } from "@/util/typeguards/websocket-message";
import { FC, useRef, useState } from "react";
import { useWebSocket } from "./use-websocket";

type Props = {
  serial: string;
};

export const ArtBoard: FC<Props> = ({ serial }) => {
  const [color, setColor] = useState<PaletteColors>("#f00");
  const ref = useRef<HTMLCanvasElement>(null);

  const { isConnected, webSocket, reconnect, send } = useWebSocket();

  const handleDrawPixel = (pixel: Pixel) => {
    if (!isConnected) {
      return;
    }
    send({
      serial,
      message: {
        command: "set",
        ...pixel,
      },
    });
  };

  const handleClickClear = () => {
    if (!isConnected) {
      return;
    }
    const canvas = ref.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    send({
      serial,
      message: { command: "clear" },
    });
  };

  return (
    <div className="flex m-5 gap-5">
      <ColorPicker color={color} onChange={setColor} />
      <div className="p-6 rounded-lg bg-wood relative">
        {!isConnected && (
          <div
            className="
              bg-[#ffffffe0] dark:bg-[#959595e0] 
              absolute h-[calc(100%_-_48px)] w-[calc(100%_-_48px)]
              flex items-center justify-center flex-col
            "
          >
            <div>Device not connected</div>
            <Button onClick={reconnect}>Retry</Button>
          </div>
        )}
        <Canvas ref={ref} color={color} onDrawPixel={handleDrawPixel} />
      </div>
      <Button disabled={!isConnected} onClick={handleClickClear}>
        Clear Screen
      </Button>
    </div>
  );
};
