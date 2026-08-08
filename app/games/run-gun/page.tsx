"use client";

import { useEffect, useRef } from "react";
import { Game } from "@/engine/Game";

export default function RunGunPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const game = new Game(canvas);
  game.start();
}, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#111",
      }}
    >
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        style={{
          border: "2px solid white",
        }}
      />
    </div>
  );
}