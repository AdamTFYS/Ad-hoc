"use client";

import { useMemo } from "react";
import type { Task } from "@/types";
import { computeProgress } from "@/lib/progress";
import { generateMountainLayout } from "@/lib/sisyphus/mountainPath";
import type { CharacterState } from "@/lib/sisyphus/types";
import SisyphusCanvas from "./SisyphusCanvas";

type SisyphusGoalCardProps = {
  tasks: Task[];
  className?: string;
};

export default function SisyphusGoalCard({ tasks, className = "" }: SisyphusGoalCardProps) {
  const progress = computeProgress(tasks);

  const layout = useMemo(
    () => generateMountainLayout(tasks, 300, 120),
    // Re-generate only when task ids or completion status change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks.map((t) => `${t.id}:${t.completed}`).join(",")]
  );

  const characterState: CharacterState = progress >= 1 ? "celebrating" : "resting";

  return (
    <SisyphusCanvas
      layout={layout}
      progress={progress}
      characterState={characterState}
      compact
      className={className}
      height={120}
    />
  );
}
