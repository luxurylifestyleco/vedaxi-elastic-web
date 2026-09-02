import React, { useEffect, useRef } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  label?: string;
}

export function ProtocolStage3D({ activeChapter }: { activeChapter?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Mouse parallax tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetRotY = ((e.clientX - cx) / cx) * 0.45;
      targetRotX = -((e.clientY - cy) / cy) * 0.45;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 5 Key Protocol God Nodes
    const godNodes: Node3D[] = [
      { x: -280, y: -120, z: 80, vx: 0, vy: 0, vz: 0, color: "#69e9f1", size: 8, label: "ORIGIN A: PAPER" },
      { x: 260, y: 110, z: -40, vx: 0, vy: 0, vz: 0, color: "#f59e0b", size: 8, label: "ORIGIN B: VIDEO (00:03:12)" },
      { x: 0, y: -40, z: 180, vx: 0, vy: 0, vz: 0, color: "#c5ff73", size: 10, label: "DISCREPANCY (40 - 6 = 34)" },
      { x: 180, y: -190, z: 120, vx: 0, vy: 0, vz: 0, color: "#69e9f1", size: 7, label: "WebMCP RUNTIME" },
      { x: -160, y: 190, z: 60, vx: 0, vy: 0, vz: 0, color: "#c5ff73", size: 9, label: "HUMAN GATE" },
    ];

    // Background floating particle mesh
    const particles: Node3D[] = [];
    const PARTICLE_COUNT = 55;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1100,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 600,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        color: Math.random() > 0.4 ? "#69e9f1" : "#c5ff73",
        size: Math.random() * 2.5 + 1.5,
      });
    }

    const project = (x: number, y: number, z: number, rx: number, ry: number) => {
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      const fov = 700;
      const scale = fov / (fov + z2 + 350);
      return {
        px: width / 2 + x1 * scale,
        py: height / 2 + y2 * scale,
        scale,
        z2,
      };
    };

    let t = 0;
    const render = () => {
      t += 0.012;
      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY - rotY) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const currentRotX = rotX + Math.sin(t * 0.5) * 0.08;
      const currentRotY = rotY + Math.cos(t * 0.35) * 0.12;

      const projectedParticles = particles.map((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        if (p.x < -550) p.x = 550;
        if (p.x > 550) p.x = -550;
        if (p.y < -400) p.y = 400;
        if (p.y > 400) p.y = -400;
        if (p.z < -300) p.z = 300;
        if (p.z > 300) p.z = -300;
        return { ...project(p.x, p.y, p.z, currentRotX, currentRotY), p };
      });

      for (let i = 0; i < projectedParticles.length; i++) {
        for (let j = i + 1; j < projectedParticles.length; j++) {
          const p1 = projectedParticles[i];
          const p2 = projectedParticles[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 115) {
            const alpha = (1 - dist / 115) * 0.18 * Math.min(p1.scale, p2.scale);
            ctx.strokeStyle = "rgba(105, 233, 241, " + alpha + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      projectedParticles.forEach(({ px, py, scale, p }) => {
        if (scale <= 0) return;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.15, Math.min(0.75, scale * 0.8));
        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      const projectedGods = godNodes.map((g, idx) => {
        const floatY = g.y + Math.sin(t * 1.5 + idx * 1.3) * 15;
        const floatX = g.x + Math.cos(t * 1.2 + idx * 0.9) * 10;
        return {
          ...project(floatX, floatY, g.z, currentRotX, currentRotY),
          g,
          floatX,
          floatY,
        };
      });

      for (let i = 0; i < projectedGods.length; i++) {
        for (let j = i + 1; j < projectedGods.length; j++) {
          const g1 = projectedGods[i];
          const g2 = projectedGods[j];
          const gradient = ctx.createLinearGradient(g1.px, g1.py, g2.px, g2.py);
          gradient.addColorStop(0, g1.g.color);
          gradient.addColorStop(1, g2.g.color);

          ctx.strokeStyle = gradient;
          ctx.globalAlpha = 0.32 + Math.sin(t * 2 + i + j) * 0.1;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(g1.px, g1.py);
          ctx.lineTo(g2.px, g2.py);
          ctx.stroke();

          const packetPos = (t * 0.4 + (i * 0.3 + j * 0.2)) % 1;
          const packetX = g1.px + (g2.px - g1.px) * packetPos;
          const packetY = g1.py + (g2.py - g1.py) * packetPos;
          ctx.fillStyle = "#eff7f3";
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.arc(packetX, packetY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      projectedGods.forEach(({ px, py, scale, g }) => {
        if (scale <= 0) return;

        const glowRad = g.size * 3.5 * scale;
        const radGrad = ctx.createRadialGradient(px, py, 0, px, py, glowRad);
        radGrad.addColorStop(0, g.color);
        radGrad.addColorStop(1, "transparent");
        ctx.fillStyle = radGrad;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.arc(px, py, glowRad, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = g.color;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(px, py, g.size * 2 * scale, g.size * 1.1 * scale, t * 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#eff7f3";
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(px, py, g.size * scale, 0, Math.PI * 2);
        ctx.fill();

        if (g.label) {
          ctx.font = "700 " + Math.max(8, 10 * scale) + "px SFMono-Regular, Consolas, monospace";
          ctx.fillStyle = g.color;
          ctx.globalAlpha = 0.9;
          ctx.fillText(g.label, px + g.size * scale + 8, py + 4);
        }
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [activeChapter]);

  return (
    <div className="protocol-3d-stage" aria-hidden="true">
      <canvas ref={canvasRef} className="protocol-3d-canvas" />
    </div>
  );
}
