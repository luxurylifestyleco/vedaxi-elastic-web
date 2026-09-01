export interface SkatePose {
  x: number;
  y: number;
  tilt: number;
}

/** ponytail: O(1) Lissajous rider; upgrade to a sprite sheet if we need contact shadows. */
export function skatePose(time: number, reverse: boolean): SkatePose {
  const x = 0.12 + ((Math.sin(time * 0.45) + 1) / 2) * 0.76;
  const wave = Math.sin(time * 0.9) * 0.04;
  const y = reverse ? 0.2 + wave : 0.74 - wave;
  return { x, y, tilt: Math.cos(time * 0.45) * 0.35 };
}

export function paintEditionWorld(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  reverse: boolean
): void {
  ctx.clearRect(0, 0, width, height);
  if (width < 2 || height < 2) return;

  ctx.save();
  if (reverse) {
    ctx.translate(width / 2, height / 2);
    ctx.scale(1, -1);
    ctx.translate(-width / 2, -height / 2);
  }

  for (let i = 0; i < 18; i += 1) {
    const drift = (time * (8 + i) + i * 40) % (width + 120);
    const y = ((i * 37 + time * 12) % height);
    ctx.fillStyle = `rgba(212, 175, 90, ${0.04 + (i % 5) * 0.012})`;
    ctx.beginPath();
    ctx.ellipse(drift - 60, y, 90 + i * 4, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const pose = skatePose(time, false);
  const px = pose.x * width;
  const py = pose.y * height;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(pose.tilt);
  ctx.fillStyle = "rgba(246, 239, 226, 0.92)";
  ctx.fillRect(-28, 10, 56, 7);
  ctx.strokeStyle = "rgba(196, 163, 90, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, 18);
  ctx.lineTo(-14, 24);
  ctx.moveTo(18, 18);
  ctx.lineTo(14, 24);
  ctx.stroke();
  ctx.fillStyle = "rgba(232, 196, 120, 0.95)";
  ctx.beginPath();
  ctx.ellipse(0, -6, 7, 16, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}
