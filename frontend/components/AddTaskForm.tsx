"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type AddTaskFormProps = {
  onAdd: (title: string, weight: number, dueDate?: string) => void;
};

export default function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [weight, setWeight] = useState("1");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    onAdd(trimmed, w, dueDate || undefined);
    setTitle("");
    setWeight("1");
    setDueDate("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted hover:border-accent hover:text-accent hover:bg-accent-soft transition-all"
      >
        + Add task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="animate-slide-up flex flex-col gap-2.5">
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="flex-1"
          autoFocus
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
        placeholder="Due date"
        label="Due date (optional)"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit">Add</Button>
        <Button type="button" variant="ghost" onClick={() => { setOpen(false); setError(""); }}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
