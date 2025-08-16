"use client";

import { useRef, useEffect, useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Trash2, Eraser } from "lucide-react";

interface DoodleProps {
  widgetId: string;
}

export default function Doodle({ widgetId }: DoodleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useLocalStorage(
    `doodle-color-${widgetId}`,
    "#000000"
  );
  const [isErasing, setIsErasing] = useState(false);
  const [savedDrawing, setSavedDrawing] = useLocalStorage(
    `doodle-widget-${widgetId}`,
    ""
  );

  const getContext = () => canvasRef.current?.getContext("2d");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getContext();
    if (!ctx) return;

    // Set canvas dimensions based on parent size
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    if (savedDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = savedDrawing;
    }

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const pos = getMousePos(e);
      setIsDrawing(true);
      const ctx = getContext();
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getMousePos(e);
      const ctx = getContext();
      if (!ctx) return;
      ctx.lineWidth = isErasing ? 20 : 5;
      ctx.lineCap = "round";
      ctx.strokeStyle = isErasing ? "#FFFFFF" : color; // Assuming white background
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      const ctx = getContext();
      if (!ctx) return;
      ctx.closePath();
      setIsDrawing(false);
      saveDrawing();
    };

    const getMousePos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e instanceof TouchEvent ? e.touches[0] : null;
      return {
        x: touch
          ? touch.clientX - rect.left
          : (e as MouseEvent).clientX - rect.left,
        y: touch
          ? touch.clientY - rect.top
          : (e as MouseEvent).clientY - rect.top,
      };
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    canvas.addEventListener("touchstart", startDrawing);
    canvas.addEventListener("touchmove", draw);
    canvas.addEventListener("touchend", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);

      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
    };
  }, [isDrawing, color, isErasing, savedDrawing]);

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setSavedDrawing(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getContext();
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveDrawing();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center gap-2 p-1 border-b">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8"
        />
        <Button
          variant={isErasing ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setIsErasing(!isErasing)}
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearCanvas}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-grow relative">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full bg-white rounded-b-md"
        />
      </div>
    </div>
  );
}
