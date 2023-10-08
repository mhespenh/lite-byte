"use client";

import {
  MouseEventHandler,
  MutableRefObject,
  forwardRef,
  useEffect,
  useRef,
} from "react";

// How many LEDs are there
const HEIGHT_PIXELS = 32;
const WIDTH_PIXELS = 64;
// 1 LED pixel = CANVAS_SCALE * computer pixels
// For example a 60x120 LED matrix at 10 CANVAS_SCALE would be 600x1200 pixels
const CANVAS_SCALE = 10;
// How many LED pixels wide is the stroke
const STROKE_WIDTH_PIXELS = 1;

const PIXEL_BORDER_COLOR = "#333333";
const PIXEL_BORDER_SIZE = 1;
const PIXEL_BORER_RADIUS = 2;

type Coordinate = {
  x: number;
  y: number;
};

export type Pixel = Coordinate & {
  color: string;
};

type Props = {
  color: string;
  heightPixels?: number;
  widthPixels?: number;
  canvasScale?: number;
  strokeWidthPixels?: number;
  onDrawPixel: (pixel: Pixel) => void;
};

export const Canvas = forwardRef<HTMLCanvasElement, Props>(
  (
    {
      color,
      onDrawPixel,
      heightPixels = HEIGHT_PIXELS,
      widthPixels = WIDTH_PIXELS,
      canvasScale = CANVAS_SCALE,
      strokeWidthPixels = STROKE_WIDTH_PIXELS,
    },
    ref
  ) => {
    const bounds = useRef<Coordinate>();
    const lastPixelLocation = useRef<Coordinate>();

    useEffect(() => {
      const { x, y } =
        (
          ref as MutableRefObject<HTMLCanvasElement>
        ).current?.getBoundingClientRect() ?? {};
      if (x === undefined || y === undefined) return;

      bounds.current = { x, y };
    }, [ref]);

    // How many computer pixels wide is the stroke
    const canvasScaledPixels = strokeWidthPixels * canvasScale;

    const snapToPixel = (n: number) =>
      Math.floor(n / canvasScaledPixels) * canvasScaledPixels;

    const drawPixel = (
      clientX: number,
      clientY: number,
      color: Props["color"]
    ) => {
      const canvas = (ref as MutableRefObject<HTMLCanvasElement>).current;
      if (!bounds.current || !canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const x = snapToPixel(clientX - bounds.current.x);
      const y = snapToPixel(clientY - bounds.current.y);
      onDrawPixel({ x: x / 10, y: y / 10, color });

      context.fillStyle = color;
      context.beginPath();
      context.roundRect(
        x + PIXEL_BORDER_SIZE,
        y + PIXEL_BORDER_SIZE,
        canvasScaledPixels - PIXEL_BORDER_SIZE,
        canvasScaledPixels - PIXEL_BORDER_SIZE,
        PIXEL_BORER_RADIUS
      );
      context.fill();
    };

    const handleMouseDown: MouseEventHandler<HTMLCanvasElement> = (e) => {
      drawPixel(e.clientX, e.clientY, color);
    };

    const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = (e) => {
      // If the mouse is not down, do nothing
      if (e.buttons === 0) return;

      if (!bounds.current) return;

      // Only draw a pixel if the mouse has moved to a new pixel
      const x = snapToPixel(e.clientX - bounds.current.x) / canvasScale;
      const y = snapToPixel(e.clientY - bounds.current.y) / canvasScale;

      if (
        x === lastPixelLocation.current?.x &&
        y === lastPixelLocation.current?.y
      )
        return;

      lastPixelLocation.current = { x, y };
      drawPixel(e.clientX, e.clientY, color);
    };

    return (
      <canvas
        width={widthPixels * canvasScale}
        height={heightPixels * canvasScale}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        className="cursor-pointer bg-gray-900"
        ref={ref}
      />
    );
  }
);

Canvas.displayName = "Canvas";
