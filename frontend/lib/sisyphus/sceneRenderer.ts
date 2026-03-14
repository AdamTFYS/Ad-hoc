import type { CharacterState, MountainLayout, PathPoint } from "./types";
import { getPositionOnPath } from "./mountainPath";
import { drawCharacter } from "./characterRenderer";

type SceneColors = {
  foreground: string;
  accent: string;
  muted: string;
  surface: string;
  border: string;
};

function getComputedColors(ctx: CanvasRenderingContext2D): SceneColors {
  const style = getComputedStyle(ctx.canvas);
  return {
    foreground: style.getPropertyValue("--foreground").trim() || "#0f172a",
    accent: style.getPropertyValue("--accent").trim() || "#6366f1",
    muted: style.getPropertyValue("--muted").trim() || "#64748b",
    surface: style.getPropertyValue("--surface-2").trim() || "#f1f5f9",
    border: style.getPropertyValue("--border").trim() || "#e2e8f0",
  };
}

/**
 * Renders the full Sisyphus scene onto the canvas.
 */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  layout: MountainLayout,
  progress: number,
  characterState: CharacterState,
  frame: number,
  compact: boolean,
  lockInMode = false
) {
  const { path, checkpoints, summit, bounds } = layout;
  const w = bounds.width;
  const h = bounds.height;

  let colors: SceneColors;
  if (lockInMode) {
    colors = {
      foreground: "#e2e8f0",
      accent: "#818cf8",
      muted: "#94a3b8",
      surface: "#1c2035",
      border: "#2a2f45",
    };
  } else {
    colors = getComputedColors(ctx);
  }

  ctx.clearRect(0, 0, w, h);

  if (path.length < 2) return;

  const scale = compact ? 0.6 : 1;

  // Draw mountain fill (subtle gradient)
  drawMountainFill(ctx, path, w, h, colors.surface, compact);

  // Draw the full path (dashed, faint)
  drawPath(ctx, path, colors.border, 1.5 * scale, [4, 4]);

  // Draw completed portion of path (solid accent)
  if (progress > 0) {
    const completedIndex = Math.floor(progress * (path.length - 1));
    const completedPath = path.slice(0, completedIndex + 1);
    drawPath(ctx, completedPath, colors.accent, 2.5 * scale, []);
  }

  // Draw checkpoints (campfires or dots)
  for (const cp of checkpoints) {
    const pos = path[cp.pathIndex];
    if (!pos) continue;
    if (compact) {
      drawDot(ctx, pos, cp.completed ? colors.accent : colors.muted, 3 * scale);
    } else {
      drawCampfire(ctx, pos, cp.completed, colors, frame, scale);
    }
  }

  // Draw summit flag
  drawFlag(ctx, summit, progress >= 1, colors, scale);

  // Draw character
  const { point, angle } = getPositionOnPath(path, progress);
  drawCharacter(
    ctx,
    point.x,
    point.y,
    angle,
    frame,
    characterState,
    scale,
    { body: colors.foreground, accent: colors.accent, muted: colors.muted }
  );
}

function drawMountainFill(
  ctx: CanvasRenderingContext2D,
  path: PathPoint[],
  w: number,
  h: number,
  color: string,
  compact: boolean
) {
  ctx.save();
  ctx.globalAlpha = compact ? 0.3 : 0.15;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  // Close shape along the right/bottom edge
  ctx.lineTo(w, path[path.length - 1].y);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.lineTo(0, path[0].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawPath(
  ctx: CanvasRenderingContext2D,
  path: PathPoint[],
  color: string,
  width: number,
  dash: number[]
) {
  if (path.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  pos: PathPoint,
  color: string,
  radius: number
) {
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawCampfire(
  ctx: CanvasRenderingContext2D,
  pos: PathPoint,
  completed: boolean,
  colors: SceneColors,
  frame: number,
  scale: number
) {
  const s = scale;

  // Logs
  ctx.save();
  ctx.strokeStyle = completed ? colors.accent : colors.muted;
  ctx.lineWidth = 2 * s;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(pos.x - 5 * s, pos.y + 3 * s);
  ctx.lineTo(pos.x + 5 * s, pos.y + 3 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(pos.x - 4 * s, pos.y + 1 * s);
  ctx.lineTo(pos.x + 4 * s, pos.y + 5 * s);
  ctx.stroke();

  // Fire flames (animated)
  if (completed) {
    const flicker = Math.sin(frame * 0.2) * 2 * s;
    const flameColors = ["#f59e0b", "#ef4444", "#f97316"];
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * 3 * s;
      const flameH = (6 + Math.sin(frame * 0.15 + i * 2) * 2) * s;
      ctx.fillStyle = flameColors[i];
      ctx.beginPath();
      ctx.ellipse(
        pos.x + offset,
        pos.y - flameH / 2 + flicker * 0.5,
        2 * s,
        flameH,
        0,
        0,
        Math.PI * 2
      );
      ctx.globalAlpha = 0.7;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawFlag(
  ctx: CanvasRenderingContext2D,
  summit: PathPoint,
  reached: boolean,
  colors: SceneColors,
  scale: number
) {
  const s = scale;
  const flagColor = reached ? colors.accent : colors.muted;

  ctx.save();
  ctx.strokeStyle = flagColor;
  ctx.lineWidth = 2 * s;
  ctx.lineCap = "round";

  // Pole
  ctx.beginPath();
  ctx.moveTo(summit.x, summit.y + 5 * s);
  ctx.lineTo(summit.x, summit.y - 15 * s);
  ctx.stroke();

  // Flag triangle
  ctx.fillStyle = flagColor;
  ctx.globalAlpha = reached ? 0.9 : 0.4;
  ctx.beginPath();
  ctx.moveTo(summit.x, summit.y - 15 * s);
  ctx.lineTo(summit.x + 10 * s, summit.y - 11 * s);
  ctx.lineTo(summit.x, summit.y - 7 * s);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}
