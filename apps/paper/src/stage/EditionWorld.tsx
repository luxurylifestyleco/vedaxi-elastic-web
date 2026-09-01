import { useEffect, useRef } from "react";

import { paintEditionWorld } from "./edition-world";

export function EditionWorld({ reverse }: { reverse: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frame = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      canvas.width = Math.max(1, canvas.clientWidth);
      canvas.height = Math.max(1, canvas.clientHeight);
    };
    const draw = (timestamp: number) => {
      paintEditionWorld(ctx, canvas.width, canvas.height, timestamp / 1000, reverse);
      if (!reduced) frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduced) draw(0);
    else frame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [reverse]);

  return <canvas ref={canvasRef} className="edition-world" aria-hidden="true" />;
}
