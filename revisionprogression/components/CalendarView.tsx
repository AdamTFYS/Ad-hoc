"use client";

import { useState, useEffect, useMemo } from "react";
import type { Goal, StudySession } from "@/types";
import { api } from "@/lib/api";
import { getMonthGrid, todayISO, isOverdue } from "@/lib/dates";
import Button from "@/components/ui/Button";
import DayDetail, { type CalendarItem } from "@/components/DayDetail";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ShimmerCalendar() {
  return (
    <div className="grid grid-cols-7 gap-px rounded-xl border border-border bg-border overflow-hidden">
      {Array.from({ length: 35 }, (_, i) => (
        <div key={i} className="min-h-[4.5rem] bg-surface-1 p-1.5">
          <div className="animate-shimmer h-5 w-5 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function CalendarView() {
  const today = todayISO();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    api
      .getGoals()
      .then(setGoals)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    api.getSessions({ month: monthStr }).then(setSessions).catch(() => {});
  }, [year, month]);

  const goalMap = useMemo(() => {
    const m = new Map<string, Goal>();
    for (const g of goals) m.set(g.id, g);
    return m;
  }, [goals]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const goal of goals) {
      if (goal.dueDate) {
        const items = map.get(goal.dueDate) ?? [];
        items.push({ kind: "goal", goal });
        map.set(goal.dueDate, items);
      }
      for (const task of goal.tasks) {
        if (task.dueDate) {
          const items = map.get(task.dueDate) ?? [];
          items.push({ kind: "task", task, goalTitle: goal.title });
          map.set(task.dueDate, items);
        }
      }
    }
    for (const s of sessions) {
      const items = map.get(s.date) ?? [];
      const goal = goalMap.get(s.goalId);
      const task = goal?.tasks.find((t) => t.id === s.taskId);
      items.push({
        kind: "session",
        session: s,
        goalTitle: goal?.title ?? "Unknown",
        taskTitle: task?.title ?? "Unknown",
      });
      map.set(s.date, items);
    }
    return map;
  }, [goals, sessions, goalMap]);

  const { startOffset, daysInMonth } = getMonthGrid(year, month);

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }

  function dateStr(day: number): string {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  const cells: (number | null)[] = [
    ...Array.from<null>({ length: startOffset }).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const remaining = cells.length % 7;
  if (remaining > 0) {
    cells.push(...Array.from<null>({ length: 7 - remaining }).fill(null));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Month navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={prevMonth}>
          &larr; Prev
        </Button>
        <h2 className="text-lg font-semibold text-foreground">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <Button variant="ghost" onClick={nextMonth}>
          Next &rarr;
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-muted">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <ShimmerCalendar />
      ) : (
        <div className="grid grid-cols-7 gap-px rounded-xl border border-border bg-border overflow-hidden">
          {cells.map((day, i) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${i}`}
                  className="min-h-[4.5rem] bg-surface-2"
                />
              );
            }

            const ds = dateStr(day);
            const items = itemsByDate.get(ds) ?? [];
            const isToday = ds === today;
            const isSelected = ds === selectedDate;

            return (
              <button
                key={ds}
                onClick={() => setSelectedDate(isSelected ? null : ds)}
                className={`min-h-[4.5rem] p-1.5 text-left transition-colors bg-surface-1 hover:bg-accent-soft ${
                  isSelected ? "ring-2 ring-accent ring-inset" : ""
                }`}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? "bg-accent text-white"
                      : "text-foreground"
                  }`}
                >
                  {day}
                </span>
                {items.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {items.slice(0, 3).map((item) => {
                      const key =
                        item.kind === "goal"
                          ? `g-${item.goal.id}`
                          : item.kind === "task"
                            ? `t-${item.task.id}`
                            : `s-${item.session.id}`;
                      const dotColor =
                        item.kind === "session"
                          ? "bg-green-500"
                          : item.kind === "goal"
                            ? isOverdue(ds) && computeGoalIncomplete(item.goal)
                              ? "bg-red-500"
                              : "bg-indigo-500"
                            : item.task.completed
                              ? "bg-green-500"
                              : isOverdue(ds) && !item.task.completed
                                ? "bg-red-500"
                                : "bg-amber-500";
                      return (
                        <span
                          key={key}
                          className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor}`}
                        />
                      );
                    })}
                    {items.length > 3 && (
                      <span className="text-[9px] leading-none text-muted-foreground">
                        +{items.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Day detail panel */}
      {selectedDate && (
        <div className="mt-4 animate-slide-up">
          <DayDetail
            date={selectedDate}
            items={itemsByDate.get(selectedDate) ?? []}
            onClose={() => setSelectedDate(null)}
          />
        </div>
      )}
    </div>
  );
}

function computeGoalIncomplete(goal: Goal): boolean {
  if (goal.tasks.length === 0) return true;
  return goal.tasks.some((t) => !t.completed);
}
