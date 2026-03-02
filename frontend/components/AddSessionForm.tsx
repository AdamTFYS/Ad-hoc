"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { todayISO } from "@/lib/dates";
import type { StudySession } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type AddSessionFormProps = {
  taskId: string;
  goalId: string;
  onSessionCreated: (session: StudySession) => void;
};

export default function AddSessionForm({ taskId, goalId, onSessionCreated }: AddSessionFormProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setDate(todayISO());
    setStartTime("");
    setEndTime("");
    setTitle("");
    setNotes("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startTime || !endTime) {
      setError("Start and end times are required");
      return;
    }
    if (endTime <= startTime) {
      setError("End time must be after start time");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const session = await api.createSession({
        taskId,
        goalId,
        date,
        startTime,
        endTime,
        title: title.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onSessionCreated(session);
      reset();
      setOpen(false);
    } catch {
      setError("Failed to save session");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted hover:border-accent hover:text-accent hover:bg-accent-soft transition-all"
      >
        + Add session manually
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="animate-slide-up flex flex-col gap-3 rounded-xl border border-border bg-surface-1 p-4 shadow-sm">
      <div className="grid grid-cols-3 gap-2">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Start"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <Input
          label="End"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <Input
        label="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Chapter 3 review"
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about this session..."
          rows={2}
          className="rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 focus:shadow-md"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Add Session"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => { reset(); setOpen(false); }}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
