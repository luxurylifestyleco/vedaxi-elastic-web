import { useEffect, useRef, useState } from "react";

export function HeroBurnIntro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasBurned, setHasBurned] = useState(false);
  const progressRef = useRef(0);
  const burningRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const embers: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
      color: string;
    }> = [];

    const resize = () => {
      canvas.width = Math.max(1, canvas.clientWidth * (window.devicePixelRatio || 1));
      canvas.height = Math.max(1, canvas.clientHeight * (window.devicePixelRatio || 1));
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    resize();
    window.addEventListener("resize", resize);

    function getBurnNoise(x: number, y: number) {
      const s1 = Math.sin(x * 0.015 + y * 0.012);
      const s2 = Math.cos(x * 0.025 - y * 0.02);
      const s3 = Math.sin((x + y) * 0.035);
      return (s1 + s2 + s3) / 3;
    }

    function createEmbers(cx: number, cy: number) {
      for (let i = 0; i < 5; i++) {
        embers.push({
          x: cx + (Math.random() - 0.5) * 60,
          y: cy + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 4 - 1.5,
          size: Math.random() * 3.5 + 1.5,
          alpha: 1,
          decay: Math.random() * 0.025 + 0.015,
          color: Math.random() > 0.35 ? "#ff7700" : "#ffd23f"
        });
      }
    }

    function drawHeroParchment(w: number, h: number) {
      // Antique parchment overlay
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#ece2cf");
      grad.addColorStop(0.5, "#e5d7be");
      grad.addColorStop(1, "#dac8ab");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Gold Filigree Border
      ctx.strokeStyle = "#c4a056";
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, w - 32, h - 32);

      ctx.strokeStyle = "#8a7a60";
      ctx.lineWidth = 1;
      ctx.strokeRect(22, 22, w - 44, h - 44);

      // Masthead
      ctx.fillStyle = "#3a3528";
      ctx.font = "bold 15px serif";
      ctx.fillText("VEDAXI ATELIER · 2026", 40, 56);

      ctx.fillStyle = "#1e1b15";
      ctx.font = "bold clamp(20px, 4vw, 32px) serif";
      ctx.fillText("Attention recovery after interrupted analytical work", 40, 105);

      ctx.fillStyle = "#6e624f";
      ctx.font = "italic 13px serif";
      ctx.fillText("A Controlled Research Publication with Sovereign WebMCP Verification", 40, 135);

      ctx.fillStyle = "#d9534f";
      ctx.fillRect(40, 160, 160, 26);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.fillText("IGNITING LIVE TRUTH...", 48, 177);
    }

    function render() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const p = progressRef.current;

      if (p < 1) {
        drawHeroParchment(w, h);

        if (p > 0) {
          const maxRadius = Math.hypot(w, h) * 0.75;
          const currentRadius = p * maxRadius;

          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          const centerX = w / 2;
          const centerY = h / 2;

          for (let angle = 0; angle < Math.PI * 2; angle += 0.04) {
            const sampleX = centerX + Math.cos(angle) * currentRadius;
            const sampleY = centerY + Math.sin(angle) * currentRadius;
            const noise = getBurnNoise(sampleX, sampleY) * 45;
            const r = Math.max(0, currentRadius + noise);
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            if (burningRef.current && Math.random() < 0.3) {
              createEmbers(x, y);
            }
          }
          ctx.closePath();
          ctx.fill();

          ctx.globalCompositeOperation = "source-over";
          ctx.beginPath();
          for (let angle = 0; angle < Math.PI * 2; angle += 0.04) {
            const sampleX = centerX + Math.cos(angle) * currentRadius;
            const sampleY = centerY + Math.sin(angle) * currentRadius;
            const noise = getBurnNoise(sampleX, sampleY) * 45;
            const r = Math.max(0, currentRadius + noise);
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          // Charred edge
          ctx.strokeStyle = "rgba(20, 10, 5, 0.95)";
          ctx.lineWidth = 18;
          ctx.stroke();

          // Fire ember glow
          ctx.strokeStyle = "rgba(255, 110, 0, 0.92)";
          ctx.lineWidth = 8;
          ctx.shadowColor = "#ff4500";
          ctx.shadowBlur = 24;
          ctx.stroke();

          // Intense core sparks
          ctx.strokeStyle = "rgba(255, 245, 180, 0.98)";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Draw embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.alpha -= e.decay;
        if (e.alpha <= 0) {
          embers.splice(i, 1);
          continue;
        }
        ctx.fillStyle = e.color;
        ctx.globalAlpha = e.alpha;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      if (burningRef.current) {
        progressRef.current = Math.min(1, progressRef.current + 0.01);
        if (progressRef.current >= 1) {
          burningRef.current = false;
          setHasBurned(true);
        }
      }

      frame = window.requestAnimationFrame(render);
    }

    frame = window.requestAnimationFrame(render);

    // AUTO-IGNITE ON PAGE LOAD AFTER 400ms
    const timer = setTimeout(() => {
      burningRef.current = true;
    }, 400);

    return () => {
      clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (hasBurned) return null;

  return (
    <canvas
      ref={canvasRef}
      className="hero-burn-canvas"
      aria-hidden="true"
    />
  );
}
