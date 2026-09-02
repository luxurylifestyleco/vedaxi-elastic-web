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
  label: string;
  targetId?: string;
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
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;
    let hoveredNode: string | null = null;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetRotY = ((e.clientX - cx) / cx) * 0.45;
      targetRotX = -((e.clientY - cy) / cy) * 0.45;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 5 Key Protocol God Nodes with clickable chapter jump targets
    const godNodes: Node3D[] = [
      { x: -300, y: -130, z: 80, vx: 0, vy: 0, vz: 0, color: "#69e9f1", size: 9, label: "ORIGIN A: PAPER", targetId: "chapter-method" },
      { x: 280, y: 120, z: -40, vx: 0, vy: 0, vz: 0, color: "#f59e0b", size: 9, label: "ORIGIN B: VIDEO (00:03:12)", targetId: "chapter-video" },
      { x: 0, y: -50, z: 190, vx: 0, vy: 0, vz: 0, color: "#c5ff73", size: 12, label: "DISCREPANCY (40 - 6 = 34)", targetId: "chapter-evidence" },
      { x: 200, y: -200, z: 120, vx: 0, vy: 0, vz: 0, color: "#69e9f1", size: 8, label: "WebMCP RUNTIME", targetId: "paper-top" },
      { x: -180, y: 200, z: 60, vx: 0, vy: 0, vz: 0, color: "#c5ff73", size: 10, label: "HUMAN GATE", targetId: "chapter-decision" },
    ];

    let currentProjectedGods: { px: number; py: number; scale: number; g: Node3D }[] = [];

    const onClick = (e: MouseEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;
      for (const item of currentProjectedGods) {
        const dx = clickX - item.px;
        const dy = clickY - item.py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < item.g.size * item.scale * 3.5 + 15 && item.g.targetId) {
          const el = document.getElementById(item.g.targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
          break;
        }
      }
    };
    window.addEventListener("click", onClick);

    // Background floating particle mesh
    const particles: Node3D[] = [];
    const PARTICLE_COUNT = 60;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 900,
        z: (Math.random() - 0.5) * 700,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        vz: (Math.random() - 0.5) * 0.45,
        color: Math.random() > 0.4 ? "#69e9f1" : "#c5ff73",
        size: Math.random() * 2.5 + 1.5,
        label: "",
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

      const fov = 750;
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
      t += 0.014;
      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY - rotY) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const currentRotX = rotX + Math.sin(t * 0.5) * 0.08;
      const currentRotY = rotY + Math.cos(t * 0.35) * 0.12;

      // Project particles
      const projectedParticles = particles.map((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        if (p.x < -600) p.x = 600;
        if (p.x > 600) p.x = -600;
        if (p.y < -450) p.y = 450;
        if (p.y > 450) p.y = -450;
        if (p.z < -350) p.z = 350;
        if (p.z > 350) p.z = -350;
        return { ...project(p.x, p.y, p.z, currentRotX, currentRotY), p };
      });

      // Connect near particles
      for (let i = 0; i < projectedParticles.length; i++) {
        for (let j = i + 1; j < projectedParticles.length; j++) {
          const p1 = projectedParticles[i];
          const p2 = projectedParticles[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.18 * Math.min(p1.scale, p2.scale);
            ctx.strokeStyle = "rgba(105, 233, 241, " + alpha + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      projectedParticles.forEach(({ px, py, scale, p }) => {
        if (scale <= 0) return;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.15, Math.min(0.75, scale * 0.8));
        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Project God Nodes
      currentProjectedGods = godNodes.map((g, idx) => {
        const floatY = g.y + Math.sin(t * 1.5 + idx * 1.3) * 15;
        const floatX = g.x + Math.cos(t * 1.2 + idx * 0.9) * 10;
        return {
          ...project(floatX, floatY, g.z, currentRotX, currentRotY),
          g,
        };
      });

      // Check hover
      hoveredNode = null;
      for (const item of currentProjectedGods) {
        const dx = mouseX - item.px;
        const dy = mouseY - item.py;
        if (Math.sqrt(dx * dx + dy * dy) < item.g.size * item.scale * 3.5 + 15) {
          hoveredNode = item.g.label;
          break;
        }
      }

      // Laser beams between God Nodes
      for (let i = 0; i < currentProjectedGods.length; i++) {
        for (let j = i + 1; j < currentProjectedGods.length; j++) {
          const g1 = currentProjectedGods[i];
          const g2 = currentProjectedGods[j];
          const gradient = ctx.createLinearGradient(g1.px, g1.py, g2.px, g2.py);
          gradient.addColorStop(0, g1.g.color);
          gradient.addColorStop(1, g2.g.color);

          ctx.strokeStyle = gradient;
          ctx.globalAlpha = 0.35 + Math.sin(t * 2 + i + j) * 0.12;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(g1.px, g1.py);
          ctx.lineTo(g2.px, g2.py);
          ctx.stroke();

          // Data packet flow
          const packetPos = (t * 0.45 + (i * 0.3 + j * 0.2)) % 1;
          const packetX = g1.px + (g2.px - g1.px) * packetPos;
          const packetY = g1.py + (g2.py - g1.py) * packetPos;
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(packetX, packetY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render God Nodes
      currentProjectedGods.forEach(({ px, py, scale, g }) => {
        if (scale <= 0) return;
        const isHovered = hoveredNode === g.label;
        const multiplier = isHovered ? 1.4 : 1.0;

        // Radial glow
        const glowRad = g.size * 4 * scale * multiplier;
        const radGrad = ctx.createRadialGradient(px, py, 0, px, py, glowRad);
        radGrad.addColorStop(0, g.color);
        radGrad.addColorStop(1, "transparent");
        ctx.fillStyle = radGrad;
        ctx.globalAlpha = isHovered ? 0.7 : 0.45;
        ctx.beginPath();
        ctx.arc(px, py, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Orbital ring
        ctx.strokeStyle = g.color;
        ctx.globalAlpha = isHovered ? 0.9 : 0.6;
        ctx.lineWidth = isHovered ? 2 : 1.2;
        ctx.beginPath();
        ctx.ellipse(px, py, g.size * 2.2 * scale * multiplier, g.size * 1.2 * scale * multiplier, t * 2, 0, Math.PI * 2);
        ctx.stroke();

        // Node center
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(px, py, g.size * scale * multiplier, 0, Math.PI * 2);
        ctx.fill();

        // Label pill tag
        if (g.label) {
          const fontSize = Math.max(9, Math.round(11 * scale * (isHovered ? 1.2 : 1)));
          ctx.font = "700 " + fontSize + "px SFMono-Regular, Consolas, monospace";
          
          // Background tag pill
          const textWidth = ctx.measureText(g.label).width;
          const tagX = px + g.size * scale + 8;
          const tagY = py - fontSize / 2;
          
          ctx.fillStyle = "rgba(6, 18, 27, 0.85)";
          ctx.strokeStyle = g.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(tagX - 4, tagY - 4, textWidth + 8, fontSize + 8, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = g.color;
          ctx.globalAlpha = 1;
          ctx.fillText(g.label, tagX, py + fontSize / 3);
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
      window.removeEventListener("click", onClick);
    };
  }, [activeChapter]);

  return (
    <div className="protocol-3d-stage" aria-hidden="true">
      <canvas ref={canvasRef} className="protocol-3d-canvas" />
    </div>
  );
}
