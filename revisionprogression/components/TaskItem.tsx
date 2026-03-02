"use client";

import { useState } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";
import { formatDate, isOverdue } from "@/lib/dates";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type TaskItemProps = {
  task: Task;
  onToggle: (task: Task) => void;
  onUpdate: (taskId: string, title: string, weight: number, dueDate?: string) => void;
  onDelete: (taskId: string) => void;
};

export default function TaskItem({ task, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [weight, setWeight] = useState(String(task.weight));
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [error, setError] = useState("");

  function handleSave() {
    const trimmed = title.trim();
    const w = parseFloat(weight);
    if (!trimmed) {
      setError("Title is required");
      return;
    }
    if (isNaN(w) || w <= 0) {
      setError("Weight must be a positive number");
      return;
    }
    setError("");
    onUpdate(task.id, trimmed, w, dueDate || undefined);
    setEditing(false);
  }

  function handleCancel() {
    setTitle(task.title);
    setWeight(String(task.weight));
    setDueDate(task.dueDate ?? "");
    setError("");
    setEditing(false);
  }

  const overdue = task.dueDate && !task.completed && isOverdue(task.dueDate);

  if (editing) {
    return (
      <div className="animate-slide-up flex flex-col gap-2.5 rounded-lg border border-accent/30 bg-accent-soft p-3">
        <div className="flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="flex-1"
          />
          <Input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight"
            type="number"
            min="0.1"
            step="0.1"
            className="w-20"
          />
        </div>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          label="Due date"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleSave}>Save</Button>
          <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2.5 rounded-lg px-1.5 py-2 hover:bg-surface-2 transition-colors"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-muted"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        className="h-4 w-4 rounded border-border accent-accent"
      />
      <Link
        href={`/goals/${task.goalId}/tasks/${task.id}`}
        className={`flex-1 text-sm cursor-pointer hover:underline ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
      >
        {task.title}
      </Link>
      {task.dueDate && (
        <span className={`text-xs ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
          {formatDate(task.dueDate)}
        </span>
      )}
      <span className="text-xs text-muted-foreground">w:{task.weight}</span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" className="!px-1.5 !py-0.5 text-xs" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button variant="ghost" className="!px-1.5 !py-0.5 text-xs text-red-500" onClick={() => onDelete(task.id)}>
          Del
        </Button>
      </div>
    </div>
  );
}
