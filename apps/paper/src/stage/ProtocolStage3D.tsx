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

    // Mouse & Touch parallax tracking
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;
    let hoveredNode: string | null = null;

    const updatePointer = (clientX: number, clientY: number) => {
      mouseX = clientX;
      mouseY = clientY;
      const cx = width / 2;
      const cy = height / 2;
      targetRotY = ((clientX - cx) / cx) * 0.55;
      targetRotX = -((clientY - cy) / cy) * 0.55;
    };

    const onMouseMove = (e: MouseEvent) => {
      updatePointer(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchMove, { passive: true });

    // 5 Key Protocol God Nodes
    const baseGodNodes: Node3D[] = [
      { x: -280, y: -120, z: 80, vx: 0, vy: 0, vz: 0, color: "#69e9f1", size: 9, label: "ORIGIN A: PAPER", targetId: "chapter-method" },
      { x: 260, y: 110, z: -40, vx: 0, vy: 0, vz: 0, color: "#f59e0b", size: 9, label: "ORIGIN B: VIDEO (00:03:12)", targetId: "chapter-video" },
      { x: 0, y: -40, z: 180, vx: 0, vy: 0, vz: 0, color: "#c5ff73", size: 12, label: "DISCREPANCY (40 - 6 = 34)", targetId: "chapter-evidence" },
      { x: 180, y: -180, z: 120, vx: 0, vy: 0, vz: 0, color: "#69e9f1", size: 8, label: "WebMCP RUNTIME", targetId: "paper-top" },
      { x: -160, y: 180, z: 60, vx: 0, vy: 0, vz: 0, color: "#c5ff73", size: 10, label: "HUMAN GATE", targetId: "chapter-decision" },
    ];

    let currentProjectedGods: { px: number; py: number; scale: number; g: Node3D }[] = [];

    const handleTap = (clientX: number, clientY: number) => {
      for (const item of currentProjectedGods) {
        const dx = clientX - item.px;
        const dy = clientY - item.py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < item.g.size * item.scale * 3.5 + 25 && item.g.targetId) {
          const el = document.getElementById(item.g.targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
          break;
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      handleTap(e.clientX, e.clientY);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches && e.changedTouches[0]) {
        handleTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    };

    window.addEventListener("click", onClick);
    window.addEventListener("touchend", onTouchEnd);

    // Floating particle mesh
    const particles: Node3D[] = [];
    const isMobile = width < 768;
    const PARTICLE_COUNT = isMobile ? 35 : 60;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * (isMobile ? 700 : 1200),
        y: (Math.random() - 0.5) * (isMobile ? 600 : 900),
        z: (Math.random() - 0.5) * 600,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        vz: (Math.random() - 0.5) * 0.45,
        color: Math.random() > 0.4 ? "#69e9f1" : "#c5ff73",
        size: Math.random() * 2 + 1.2,
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

      const fov = isMobile ? 550 : 750;
      const scale = fov / (fov + z2 + (isMobile ? 250 : 350));
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

      const maxParticleX = isMobile ? 350 : 600;
      const maxParticleY = isMobile ? 300 : 450;

      // Project ambient particles
      const projectedParticles = particles.map((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        if (p.x < -maxParticleX) p.x = maxParticleX;
        if (p.x > maxParticleX) p.x = -maxParticleX;
        if (p.y < -maxParticleY) p.y = maxParticleY;
        if (p.y > maxParticleY) p.y = -maxParticleY;
        if (p.z < -300) p.z = 300;
        if (p.z > 300) p.z = -300;
        return { ...project(p.x, p.y, p.z, currentRotX, currentRotY), p };
      });

      // Connect near particles
      const maxConnectDist = isMobile ? 85 : 120;
      for (let i = 0; i < projectedParticles.length; i++) {
        for (let j = i + 1; j < projectedParticles.length; j++) {
          const p1 = projectedParticles[i];
          const p2 = projectedParticles[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * 0.18 * Math.min(p1.scale, p2.scale);
            ctx.strokeStyle = "rgba(105, 233, 241, " + alpha + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw ambient particles
      projectedParticles.forEach(({ px, py, scale, p }) => {
        if (scale <= 0) return;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.15, Math.min(0.75, scale * 0.8));
        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Project God Nodes with responsive mobile scale factor
      const godPosScale = isMobile ? 0.6 : 1.0;
      currentProjectedGods = baseGodNodes.map((g, idx) => {
        const floatY = (g.y * godPosScale) + Math.sin(t * 1.5 + idx * 1.3) * 12;
        const floatX = (g.x * godPosScale) + Math.cos(t * 1.2 + idx * 0.9) * 8;
        return {
          ...project(floatX, floatY, g.z * godPosScale, currentRotX, currentRotY),
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

      // Draw flowing laser connection beams between God Nodes
      for (let i = 0; i < currentProjectedGods.length; i++) {
        for (let j = i + 1; j < currentProjectedGods.length; j++) {
          const g1 = currentProjectedGods[i];
          const g2 = currentProjectedGods[j];
          const gradient = ctx.createLinearGradient(g1.px, g1.py, g2.px, g2.py);
          gradient.addColorStop(0, g1.g.color);
          gradient.addColorStop(1, g2.g.color);

          ctx.strokeStyle = gradient;
          ctx.globalAlpha = 0.35 + Math.sin(t * 2 + i + j) * 0.12;
          ctx.lineWidth = isMobile ? 1.2 : 1.8;
          ctx.beginPath();
          ctx.moveTo(g1.px, g1.py);
          ctx.lineTo(g2.px, g2.py);
          ctx.stroke();

          // Animated data packet along vector
          const packetPos = (t * 0.45 + (i * 0.3 + j * 0.2)) % 1;
          const packetX = g1.px + (g2.px - g1.px) * packetPos;
          const packetY = g1.py + (g2.py - g1.py) * packetPos;
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(packetX, packetY, isMobile ? 2 : 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render God Nodes
      currentProjectedGods.forEach(({ px, py, scale, g }) => {
        if (scale <= 0) return;
        const isHovered = hoveredNode === g.label;
        const multiplier = isHovered ? 1.35 : 1.0;
        const nodeSize = g.size * (isMobile ? 0.85 : 1.0);

        // Radial glow
        const glowRad = nodeSize * 3.8 * scale * multiplier;
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
        ctx.ellipse(px, py, nodeSize * 2.1 * scale * multiplier, nodeSize * 1.1 * scale * multiplier, t * 2, 0, Math.PI * 2);
        ctx.stroke();

        // Node center core
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(px, py, nodeSize * scale * multiplier, 0, Math.PI * 2);
        ctx.fill();

        // Label pill tag
        if (g.label) {
          const fontSize = Math.max(8, Math.round((isMobile ? 8.5 : 10.5) * scale * (isHovered ? 1.15 : 1)));
          ctx.font = "700 " + fontSize + "px SFMono-Regular, Consolas, monospace";
          
          const textWidth = ctx.measureText(g.label).width;
          const tagX = px + nodeSize * scale + 6;
          const tagY = py - fontSize / 2;
          
          ctx.fillStyle = "rgba(6, 18, 27, 0.88)";
          ctx.strokeStyle = g.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(tagX - 3, tagY - 3, textWidth + 6, fontSize + 6, 3);
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
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeChapter]);

  return (
    <div className="protocol-3d-stage" aria-hidden="true">
      <canvas ref={canvasRef} className="protocol-3d-canvas" />
    </div>
  );
}
