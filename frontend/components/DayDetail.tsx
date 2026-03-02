"use client";

import Link from "next/link";
import type { Goal, Task, StudySession } from "@/types";
import { formatDate, formatTime, computeDurationMinutes, formatDuration, isOverdue } from "@/lib/dates";
import { computeProgress } from "@/lib/progress";
import ProgressBar from "@/components/ProgressBar";

export type CalendarItem =
  | { kind: "goal"; goal: Goal }
  | { kind: "task"; task: Task; goalTitle: string }
  | { kind: "session"; session: StudySession; goalTitle: string; taskTitle: string };

type DayDetailProps = {
  date: string;
  items: CalendarItem[];
  onClose: () => void;
};

export default function DayDetail({ date, items, onClose }: DayDetailProps) {
  const overdue = isOverdue(date);

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-5 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {formatDate(date, true)}
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted">Nothing on this day.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) =>
            item.kind === "goal" ? (
              <li key={`goal-${item.goal.id}`} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      overdue ? "bg-red-500" : "bg-indigo-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {item.goal.title}
                  </span>
                  <span className="text-xs text-muted-foreground">Goal</span>
                </div>
                <ProgressBar value={computeProgress(item.goal.tasks)} />
              </li>
            ) : item.kind === "task" ? (
              <li key={`task-${item.task.id}`}>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      item.task.completed
                        ? "bg-green-500"
                        : overdue
                          ? "bg-red-500"
                          : "bg-amber-500"
                    }`}
                  />
                  <Link
                    href={`/goals/${item.task.goalId}/tasks/${item.task.id}`}
                    className="text-sm text-accent hover:underline"
                  >
                    {item.task.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {item.goalTitle}
                  </span>
                  {item.task.completed && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Done
                    </span>
                  )}
                </div>
              </li>
            ) : (
              <li key={`session-${item.session.id}`}>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-foreground">
                    {formatTime(item.session.startTime)} – {formatTime(item.session.endTime)}
                  </span>
                  <span className="text-xs font-medium text-accent">
                    {formatDuration(computeDurationMinutes(item.session.startTime, item.session.endTime))}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.taskTitle} · {item.goalTitle}
                  </span>
                </div>
                {item.session.title && (
                  <p className="ml-4 text-xs text-muted">{item.session.title}</p>
                )}
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
