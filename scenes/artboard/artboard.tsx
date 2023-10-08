"use client";

import { clearScreen } from "@/actions/clear-screen";
import { drawPixels } from "@/actions/draw-pixels";
import { Button } from "@/components/ui/button";
import { Canvas, Pixel } from "@/scenes/artboard/canvas";
import { ColorPicker } from "@/scenes/artboard/color-picker";
import { FC, startTransition, useEffect, useRef, useState } from "react";

type Props = {
  id: number;
};

export const ArtBoard: FC<Props> = ({ id }) => {
  const [color, setColor] = useState("#f00");
  const pixelBuffer = useRef<Pixel[]>([]);
  const ref = useRef<HTMLCanvasElement>(null);

  const handleBufferPixel = (pixel: Pixel) => pixelBuffer.current.push(pixel);

  useEffect(() => {
    const handle = setInterval(() => {
      if (!pixelBuffer.current.length) return;

      startTransition(() => {
        drawPixels({
          pixels: pixelBuffer.current,
          id,
        });
      });
      pixelBuffer.current = [];
    }, 100);

    return () => clearInterval(handle);
  }, [id]);

  const handleClickClear = () => {
    const canvas = ref.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    startTransition(() => {
      clearScreen({ id });
    });
  };

  return (
    <div className="flex m-5 gap-5">
      <ColorPicker color={color} onChange={setColor} />
      <div className="p-6 rounded-lg bg-wood">
        <Canvas ref={ref} color={color} onDrawPixel={handleBufferPixel} />
      </div>
      <Button onClick={handleClickClear}>Clear Screen</Button>
    </div>
  );
};
