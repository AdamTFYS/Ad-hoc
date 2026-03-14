import type { Task } from "@/types";
import type { MountainLayout, PathPoint, Checkpoint } from "./types";

/**
 * Generates a winding mountain path layout from task structure.
 * Each task gets one switchback segment; alternate left-to-right and right-to-left.
 * Plateaus at task boundaries serve as campfire rest stops.
 */
export function generateMountainLayout(
  tasks: Task[],
  canvasWidth: number,
  canvasHeight: number,
  padding = 20
): MountainLayout {
  const w = canvasWidth;
  const h = canvasHeight;
  const left = padding;
  const right = w - padding;
  const bottom = h - padding;
  const top = padding;
  const usableHeight = bottom - top;
  const usableWidth = right - left;

  // Handle edge cases
  if (tasks.length === 0) {
    const mid = { x: w / 2, y: h / 2 };
    return { path: [mid], checkpoints: [], summit: mid, bounds: { width: w, height: h } };
  }

  // Calculate weight for each task to determine segment height
  const totalWeight = tasks.reduce((sum, t) => sum + t.weight, 0) || tasks.length;
  const points: PathPoint[] = [];
  const checkpoints: Checkpoint[] = [];

  // Density of points for smooth interpolation
  const POINTS_PER_SEGMENT = 30;
  const PLATEAU_POINTS = 8;

  let currentY = bottom;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const weight = totalWeight > 0 ? task.weight / totalWeight : 1 / tasks.length;
    const segmentHeight = usableHeight * weight;
    const goingRight = i % 2 === 0;

    const startX = goingRight ? left : right;
    const endX = goingRight ? right : left;
    const startY = currentY;
    const endY = currentY - segmentHeight;

    // Cubic bezier control points for a nice curve
    const cp1x = startX + (endX - startX) * 0.3;
    const cp1y = startY - segmentHeight * 0.1;
    const cp2x = startX + (endX - startX) * 0.7;
    const cp2y = endY + segmentHeight * 0.1;

    // Generate points along the bezier curve
    for (let j = 0; j < POINTS_PER_SEGMENT; j++) {
      const t = j / POINTS_PER_SEGMENT;
      const x = cubicBezier(t, startX, cp1x, cp2x, endX);
      const y = cubicBezier(t, startY, cp1y, cp2y, endY);
      points.push({ x, y });
    }

    currentY = endY;

    // Add plateau at the end of each task (except possibly the last)
    const plateauY = currentY;
    const plateauStartX = endX;
    // Small flat plateau for the campfire
    const plateauWidth = usableWidth * 0.15;
    const plateauDir = goingRight ? -1 : 1;

    for (let j = 0; j <= PLATEAU_POINTS; j++) {
      const t = j / PLATEAU_POINTS;
      points.push({
        x: plateauStartX + plateauDir * plateauWidth * t,
        y: plateauY - Math.sin(t * Math.PI) * 2, // tiny dip for visual interest
      });
    }

    // Record checkpoint at the start of the plateau
    const checkpointIndex = points.length - PLATEAU_POINTS - 1;
    checkpoints.push({
      taskId: task.id,
      position: 0, // will be normalized below
      pathIndex: checkpointIndex,
      completed: task.completed,
    });
  }

  // Add summit point
  const summit: PathPoint = { x: points[points.length - 1].x, y: top };
  // Final climb to summit
  const lastPoint = points[points.length - 1];
  for (let j = 1; j <= 10; j++) {
    const t = j / 10;
    points.push({
      x: lastPoint.x + (summit.x - lastPoint.x) * t,
      y: lastPoint.y + (summit.y - lastPoint.y) * t,
    });
  }

  // Normalize checkpoint positions to 0–1 range
  const totalPoints = points.length;
  for (const cp of checkpoints) {
    cp.position = cp.pathIndex / (totalPoints - 1);
  }

  return {
    path: points,
    checkpoints,
    summit,
    bounds: { width: w, height: h },
  };
}

/** Cubic bezier interpolation for a single axis */
function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

/**
 * Get the interpolated position and tangent angle at a given progress (0–1) along the path.
 */
export function getPositionOnPath(
  path: PathPoint[],
  progress: number
): { point: PathPoint; angle: number } {
  const clamped = Math.max(0, Math.min(1, progress));
  const index = clamped * (path.length - 1);
  const i = Math.floor(index);
  const frac = index - i;

  if (i >= path.length - 1) {
    const last = path[path.length - 1];
    const prev = path[Math.max(0, path.length - 2)];
    return {
      point: last,
      angle: Math.atan2(last.y - prev.y, last.x - prev.x),
    };
  }

  const a = path[i];
  const b = path[i + 1];
  return {
    point: { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac },
    angle: Math.atan2(b.y - a.y, b.x - a.x),
  };
}
