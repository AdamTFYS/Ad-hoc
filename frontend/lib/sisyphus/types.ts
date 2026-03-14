export type CharacterState = "pushing" | "resting" | "walking" | "celebrating";

export type PathPoint = { x: number; y: number };

export type Checkpoint = {
  taskId: string;
  /** Normalized position along the path (0–1) */
  position: number;
  /** Index into the path points array */
  pathIndex: number;
  completed: boolean;
};

export type MountainLayout = {
  path: PathPoint[];
  checkpoints: Checkpoint[];
  summit: PathPoint;
  bounds: { width: number; height: number };
};
