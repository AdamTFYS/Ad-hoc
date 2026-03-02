"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formatDate, formatTime, computeDurationMinutes, formatDuration } from "@/lib/dates";
import type { StudySession } from "@/types";
import Button from "@/components/ui/Button";

type SessionListProps = {
  sessions: StudySession[];
  onDelete: (id: string) => void;
};

export default function SessionList({ sessions, onDelete }: SessionListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.deleteSession(id);
      onDelete(id);
    } finally {
      setDeleting(null);
    }
  }

  const sorted = [...sessions].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.startTime.localeCompare(a.startTime);
  });

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted">No study sessions yet.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {sorted.map((s) => {
        const dur = computeDurationMinutes(s.startTime, s.endTime);
        return (
          <li
            key={s.id}
            className="flex items-start justify-between rounded-xl border border-border bg-surface-1 px-4 py-3 shadow-sm"
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">
                  {formatDate(s.date)}
                </span>
                <span className="text-muted">
                  {formatTime(s.startTime)} – {formatTime(s.endTime)}
                </span>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                  {formatDuration(dur)}
                </span>
              </div>
              {s.title && (
                <span className="text-sm text-foreground">{s.title}</span>
              )}
              {s.notes && (
                <span className="text-xs text-muted">{s.notes}</span>
              )}
            </div>
            <Button
              variant="ghost"
              className="text-xs text-red-500 hover:text-red-700"
              onClick={() => handleDelete(s.id)}
              disabled={deleting === s.id}
            >
              {deleting === s.id ? "..." : "Delete"}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
