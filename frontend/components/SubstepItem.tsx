"use client";

import type { Substep } from "@/types";
import Button from "@/components/ui/Button";

type SubstepItemProps = {
  substep: Substep;
  onToggle: (substep: Substep) => void;
  onDelete: (substepId: string) => void;
};

export default function SubstepItem({ substep, onToggle, onDelete }: SubstepItemProps) {
  return (
    <div className="group flex items-center gap-2.5 rounded-lg px-1.5 py-2 hover:bg-surface-2 transition-colors">
      <input
        type="checkbox"
        checked={substep.completed}
        onChange={() => onToggle(substep)}
        className="h-4 w-4 rounded border-border accent-accent"
      />
      <span
        className={`flex-1 text-sm ${substep.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
      >
        {substep.title}
      </span>
      <Button
        variant="ghost"
        className="!px-1.5 !py-0.5 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(substep.id)}
      >
        Del
      </Button>
    </div>
  );
}
