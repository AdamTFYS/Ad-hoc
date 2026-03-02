"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type AddSubstepFormProps = {
  onAdd: (title: string) => void;
};

export default function AddSubstepForm({ onAdd }: AddSubstepFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required");
      return;
    }
    setError("");
    onAdd(trimmed);
    setTitle("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted hover:border-accent hover:text-accent hover:bg-accent-soft transition-all"
      >
        + Add sub-step
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="animate-slide-up flex flex-col gap-2.5">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Sub-step title"
        autoFocus
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
