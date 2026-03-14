"use client";

import { useMemo } from "react";
import type { Task } from "@/types";
import { generateMountainLayout } from "@/lib/sisyphus/mountainPath";
import type { CharacterState } from "@/lib/sisyphus/types";
import SisyphusCanvas from "./SisyphusCanvas";

type SisyphusLockInProps = {
  tasks: Task[];
  baseProgress: number;
  sessionProgress: number;
  isRunning: boolean;
  completed: boolean;
};

export default function SisyphusLockIn({
  tasks,
  baseProgress,
  sessionProgress,
  isRunning,
  completed,
}: SisyphusLockInProps) {
  const layout = useMemo(
    () => generateMountainLayout(tasks, 400, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks.map((t) => `${t.id}:${t.completed}`).join(",")]
  );

  // Calculate the size of the next incomplete segment
  const totalWeight = tasks.reduce((sum, t) => sum + t.weight, 0) || 1;
  const nextTask = tasks.find((t) => !t.completed);
  const nextSegmentSize = nextTask ? nextTask.weight / totalWeight : 0;

  const effectiveProgress = Math.min(1, baseProgress + sessionProgress * nextSegmentSize);

  let characterState: CharacterState;
  if (completed && effectiveProgress >= 1) {
    characterState = "celebrating";
  } else if (isRunning) {
    characterState = "pushing";
  } else {
    characterState = "resting";
  }

  return (
    <div className="flex justify-center w-full">
      <SisyphusCanvas
        layout={layout}
        progress={effectiveProgress}
        characterState={characterState}
        compact={false}
        lockInMode
        className="max-w-[400px]"
        height={300}
      />
    </div>
  );
}
