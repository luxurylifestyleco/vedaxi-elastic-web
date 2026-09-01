import { useEffect, useRef, useState } from "react";
import type { EvidenceObject } from "@vedaxi/contracts";

interface FireBurnRevealProps {
  evidence: EvidenceObject;
}

export function FireBurnReveal({ evidence }: FireBurnRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [burnProgress, setBurnProgress] = useState(0);
  const [hasBurned, setHasBurned] = useState(false);
  const progressRef = useRef(0);
  const burningRef = useRef(false);
  const autoTriggeredRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
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
      const s1 = Math.sin(x * 0.02 + y * 0.015);
      const s2 = Math.cos(x * 0.035 - y * 0.025);
      const s3 = Math.sin((x + y) * 0.04);
      return (s1 + s2 + s3) / 3;
    }

    function createEmbers(cx: number, cy: number) {
      for (let i = 0; i < 4; i++) {
        embers.push({
          x: cx + (Math.random() - 0.5) * 40,
          y: cy + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2.5,
          vy: -Math.random() * 3.5 - 1.5,
          size: Math.random() * 3 + 1.5,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.015,
          color: Math.random() > 0.3 ? "#ff6a00" : "#ffd000"
        });
      }
    }

    function drawBasePaper(w: number, h: number) {
      const paperGrad = ctx.createLinearGradient(0, 0, w, h);
      paperGrad.addColorStop(0, "#ece2cf");
      paperGrad.addColorStop(1, "#dfd2bb");
      ctx.fillStyle = paperGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#3a3528";
      ctx.font = "bold 13px serif";
      ctx.fillText("JOURNAL OF APPLIED RESEARCH SYSTEMS", 24, 38);

      ctx.fillStyle = "#8a7a60";
      ctx.font = "10px monospace";
      ctx.fillText("VEDAXI-FIXTURE-2026-014 · AUGUST 2026", 24, 54);

      ctx.strokeStyle = "#c4b598";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, 64);
      ctx.lineTo(w - 24, 64);
      ctx.stroke();

      ctx.fillStyle = "#1e1b15";
      ctx.font = "bold 16px serif";
      ctx.fillText("Attention recovery after interrupted analytical work", 24, 92);

      ctx.fillStyle = "#6e624f";
      ctx.font = "italic 11px serif";
      ctx.fillText("Mira Sen, Jon Bell, Ada Kline", 24, 112);

      ctx.fillStyle = "#2a251d";
      ctx.font = "bold 12px monospace";
      ctx.fillText("METHODS / REPORTED PARTICIPANT FLOW", 24, 145);

      ctx.fillStyle = "#3e372b";
      ctx.font = "11px serif";
      ctx.fillText("“Forty participants completed the study and were included", 24, 168);
      ctx.fillText("in the final analysis without exception.”", 24, 186);

      ctx.fillStyle = "#d9534f";
      ctx.fillRect(24, 210, 130, 24);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.fillText("UNVERIFIED CLAIM", 34, 226);
    }

    function render() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const p = progressRef.current;

      if (p < 1) {
        drawBasePaper(w, h);

        if (p > 0) {
          const maxRadius = Math.hypot(w, h) * 0.7;
          const currentRadius = p * maxRadius;

          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          const centerX = w / 2;
          const centerY = h / 2;

          for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
            const sampleX = centerX + Math.cos(angle) * currentRadius;
            const sampleY = centerY + Math.sin(angle) * currentRadius;
            const noise = getBurnNoise(sampleX, sampleY) * 35;
            const r = Math.max(0, currentRadius + noise);
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            if (burningRef.current && Math.random() < 0.25) {
              createEmbers(x, y);
            }
          }
          ctx.closePath();
          ctx.fill();

          ctx.globalCompositeOperation = "source-over";
          ctx.beginPath();
          for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
            const sampleX = centerX + Math.cos(angle) * currentRadius;
            const sampleY = centerY + Math.sin(angle) * currentRadius;
            const noise = getBurnNoise(sampleX, sampleY) * 35;
            const r = Math.max(0, currentRadius + noise);
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          ctx.strokeStyle = "rgba(20, 10, 5, 0.95)";
          ctx.lineWidth = 14;
          ctx.stroke();

          ctx.strokeStyle = "rgba(255, 120, 0, 0.9)";
          ctx.lineWidth = 6;
          ctx.shadowColor = "#ff4500";
          ctx.shadowBlur = 18;
          ctx.stroke();

          ctx.strokeStyle = "rgba(255, 240, 150, 0.95)";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

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
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      if (burningRef.current) {
        progressRef.current = Math.min(1, progressRef.current + 0.009);
        setBurnProgress(progressRef.current);
        if (progressRef.current >= 1) {
          burningRef.current = false;
          setHasBurned(true);
        }
      }

      frame = window.requestAnimationFrame(render);
    }

    frame = window.requestAnimationFrame(render);

    // AUTO-IGNITE WHEN JUDGE SCROLLS INTO VIEW
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !autoTriggeredRef.current) {
          autoTriggeredRef.current = true;
          // Small dramatic delay for visual suspense
          setTimeout(() => {
            burningRef.current = true;
          }, 300);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const replayBurn = () => {
    progressRef.current = 0;
    setBurnProgress(0);
    setHasBurned(false);
    burningRef.current = true;
  };

  return (
    <div className="fire-burn-wrapper" ref={containerRef}>
      <div className="fire-burn-controls">
        <div className="fire-burn-controls__status">
          <span className="eyebrow">Automatic Fire Ignition Reveal</span>
          <p className="mono">
            {hasBurned
              ? "✓ Unverified Claim Consumed — Provenance Verified"
              : burningRef.current
                ? `🔥 Burning in progress: ${Math.round(burnProgress * 100)}%`
                : "Auto-ignites on scroll to reveal true cohort"}
          </p>
        </div>
        <div className="fire-burn-controls__buttons">
          <button
            type="button"
            className="text-button fire-burn-btn"
            onClick={replayBurn}
          >
            🔥 Replay Ignition
          </button>
        </div>
      </div>

      <div className="fire-burn-stage" onClick={replayBurn} title="Click to replay burn effect">
        {/* UNDER-LAYER: REVEALED VERIFIED PROVENANCE */}
        <div className="fire-burn-underlayer" aria-live="polite">
          <div className="evidence-row" id="methods-participants" tabIndex={-1}>
            <blockquote cite={`${evidence.sourceOrigin}/#methods-participants`}>
              <p className="fire-burn-revealed-quote">{evidence.excerpt}</p>
            </blockquote>
            <aside className="provenance" aria-label="Evidence provenance">
              <p className="eyebrow">Publisher evidence</p>
              <dl>
                <div><dt>Locator</dt><dd>{evidence.locator}</dd></div>
                <div><dt>Origin</dt><dd className="mono">{evidence.sourceOrigin}</dd></div>
                <div><dt>Evidence ID</dt><dd className="mono">{evidence.id}</dd></div>
                <div><dt>Provenance</dt><dd>{evidence.provenance}</dd></div>
              </dl>
            </aside>
          </div>
        </div>

        {/* OVER-LAYER: BURNING CANVAS */}
        <canvas
          ref={canvasRef}
          className="fire-burn-canvas"
          style={{ pointerEvents: hasBurned ? "none" : "auto" }}
          aria-hidden={hasBurned}
        />
      </div>
    </div>
  );
}
