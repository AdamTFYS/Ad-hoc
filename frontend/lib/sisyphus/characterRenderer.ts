import type { CharacterState } from "./types";

type DrawCtx = {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  angle: number;
  frame: number;
  scale: number;
  colors: { body: string; accent: string; muted: string };
};

const TWO_PI = Math.PI * 2;

function setupStroke(ctx: CanvasRenderingContext2D, color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

/**
 * Draws the character at the given position.
 * The character is drawn facing uphill (using the path tangent angle).
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  frame: number,
  state: CharacterState,
  scale: number,
  colors: { body: string; accent: string; muted: string }
) {
  const d: DrawCtx = { ctx, x, y, angle, frame, scale, colors };

  switch (state) {
    case "pushing":
      drawPushing(d);
      break;
    case "resting":
      drawResting(d);
      break;
    case "walking":
      drawWalking(d);
      break;
    case "celebrating":
      drawCelebrating(d);
      break;
  }
}

function drawPushing(d: DrawCtx) {
  const { ctx, x, y, frame, scale, colors } = d;
  const s = scale;
  const bob = Math.sin(frame * 0.15) * 1.5 * s;
  const stride = Math.sin(frame * 0.15) * 4 * s;
  const lean = -0.3; // leaning forward into the rock

  ctx.save();
  ctx.translate(x, y);

  // Body stroke
  setupStroke(ctx, colors.body, 3 * s);

  // Legs
  ctx.beginPath();
  ctx.moveTo(-2 * s, 0);
  ctx.lineTo(-2 * s - stride, 12 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(2 * s, 0);
  ctx.lineTo(2 * s + stride, 12 * s);
  ctx.stroke();

  // Torso (leaning)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(lean * 10 * s, -14 * s + bob);
  ctx.stroke();

  // Arms reaching forward (pushing)
  const shoulderX = lean * 10 * s;
  const shoulderY = -14 * s + bob;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY + 2 * s);
  ctx.lineTo(shoulderX + 10 * s, shoulderY + 4 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY + 4 * s);
  ctx.lineTo(shoulderX + 9 * s, shoulderY + 6 * s);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(shoulderX - 1 * s, shoulderY - 6 * s, 5 * s, 0, TWO_PI);
  ctx.stroke();

  // Rock (boulder)
  const rockX = shoulderX + 14 * s;
  const rockY = shoulderY + 2 * s;
  setupStroke(ctx, colors.muted, 2.5 * s);
  ctx.beginPath();
  ctx.arc(rockX, rockY, 8 * s, 0, TWO_PI);
  ctx.fillStyle = colors.muted + "30";
  ctx.fill();
  ctx.stroke();

  // Sweat drops
  if (frame % 20 < 10) {
    const dropY = shoulderY - 12 * s - (frame % 20) * 0.5 * s;
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.ellipse(shoulderX + 4 * s, dropY, 1.5 * s, 2 * s, 0, 0, TWO_PI);
    ctx.fill();
  }

  ctx.restore();
}

function drawResting(d: DrawCtx) {
  const { ctx, x, y, frame, scale, colors } = d;
  const s = scale;
  const breathe = Math.sin(frame * 0.05) * 1 * s;

  ctx.save();
  ctx.translate(x, y);

  setupStroke(ctx, colors.body, 3 * s);

  // Legs (sitting/standing relaxed)
  ctx.beginPath();
  ctx.moveTo(-3 * s, 0);
  ctx.lineTo(-4 * s, 12 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(3 * s, 0);
  ctx.lineTo(4 * s, 12 * s);
  ctx.stroke();

  // Torso (upright)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -14 * s + breathe);
  ctx.stroke();

  // Arms down/relaxed
  ctx.beginPath();
  ctx.moveTo(0, -12 * s + breathe);
  ctx.lineTo(-7 * s, -4 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -12 * s + breathe);
  ctx.lineTo(7 * s, -4 * s);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(0, -20 * s + breathe, 5 * s, 0, TWO_PI);
  ctx.stroke();

  // Rock beside (resting on ground)
  setupStroke(ctx, colors.muted, 2.5 * s);
  ctx.beginPath();
  ctx.arc(14 * s, 4 * s, 8 * s, 0, TWO_PI);
  ctx.fillStyle = colors.muted + "30";
  ctx.fill();
  ctx.stroke();

  // Zzz
  if (frame % 60 < 40) {
    ctx.fillStyle = colors.muted;
    ctx.font = `${8 * s}px sans-serif`;
    const zOffset = (frame % 60) * 0.3 * s;
    ctx.globalAlpha = 1 - (frame % 60) / 60;
    ctx.fillText("z", 6 * s, -24 * s - zOffset);
    ctx.fillText("z", 10 * s, -28 * s - zOffset);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawWalking(d: DrawCtx) {
  const { ctx, x, y, frame, scale, colors } = d;
  const s = scale;
  const stride = Math.sin(frame * 0.12) * 5 * s;
  const bob = Math.abs(Math.sin(frame * 0.12)) * 2 * s;
  const armSwing = Math.sin(frame * 0.12) * 6 * s;

  ctx.save();
  ctx.translate(x, y);

  setupStroke(ctx, colors.body, 3 * s);

  // Legs
  ctx.beginPath();
  ctx.moveTo(-2 * s, 0);
  ctx.lineTo(-2 * s - stride, 12 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(2 * s, 0);
  ctx.lineTo(2 * s + stride, 12 * s);
  ctx.stroke();

  // Torso
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -14 * s - bob);
  ctx.stroke();

  // Arms swinging
  ctx.beginPath();
  ctx.moveTo(0, -12 * s - bob);
  ctx.lineTo(-armSwing, -4 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -12 * s - bob);
  ctx.lineTo(armSwing, -4 * s);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(0, -20 * s - bob, 5 * s, 0, TWO_PI);
  ctx.stroke();

  ctx.restore();
}

function drawCelebrating(d: DrawCtx) {
  const { ctx, x, y, frame, scale, colors } = d;
  const s = scale;
  const jump = Math.abs(Math.sin(frame * 0.08)) * 6 * s;

  ctx.save();
  ctx.translate(x, y - jump);

  setupStroke(ctx, colors.body, 3 * s);

  // Legs (spread in victory pose)
  ctx.beginPath();
  ctx.moveTo(-3 * s, 0);
  ctx.lineTo(-8 * s, 12 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(3 * s, 0);
  ctx.lineTo(8 * s, 12 * s);
  ctx.stroke();

  // Torso
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -14 * s);
  ctx.stroke();

  // Arms raised in V
  ctx.beginPath();
  ctx.moveTo(0, -12 * s);
  ctx.lineTo(-10 * s, -24 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -12 * s);
  ctx.lineTo(10 * s, -24 * s);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(0, -20 * s, 5 * s, 0, TWO_PI);
  ctx.stroke();

  // Confetti particles
  const confettiColors = [colors.accent, "#f59e0b", "#10b981", "#ef4444"];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * TWO_PI + frame * 0.03;
    const radius = (12 + Math.sin(frame * 0.1 + i) * 4) * s;
    const cx = Math.cos(angle) * radius;
    const cy = -24 * s + Math.sin(angle) * radius * 0.6;
    ctx.fillStyle = confettiColors[i % confettiColors.length];
    ctx.beginPath();
    ctx.arc(cx, cy, 2 * s, 0, TWO_PI);
    ctx.fill();
  }

  ctx.restore();
}
