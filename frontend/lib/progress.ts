import type { Task, Substep } from "@/types";

export function computeProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const total = tasks.reduce((sum, t) => sum + t.weight, 0);
  if (total === 0) return 0;
  const completed = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.weight, 0);
  return completed / total;
}

export function computeSubstepProgress(substeps: Substep[]): number {
  if (substeps.length === 0) return 0;
  return substeps.filter((s) => s.completed).length / substeps.length;
}
