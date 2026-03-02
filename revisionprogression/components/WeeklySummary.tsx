"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { computeDurationMinutes, formatDuration } from "@/lib/dates";
import type { Goal, StudySession } from "@/types";

function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  function toISO(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return { start: toISO(monday), end: toISO(sunday) };
}

type GoalBreakdown = { title: string; minutes: number };

export default function WeeklySummary() {
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [breakdown, setBreakdown] = useState<GoalBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [goals, sessions] = await Promise.all([
          api.getGoals(),
          api.getSessions(),
        ]);

        const goalMap = new Map<string, Goal>();
        for (const g of goals) goalMap.set(g.id, g);

        const { start, end } = getWeekRange();
        const weekSessions = sessions.filter(
          (s: StudySession) => s.date >= start && s.date <= end
        );

        let total = 0;
        const byGoal = new Map<string, number>();

        for (const s of weekSessions) {
          const dur = computeDurationMinutes(s.startTime, s.endTime);
          if (dur <= 0) continue;
          total += dur;
          byGoal.set(s.goalId, (byGoal.get(s.goalId) ?? 0) + dur);
        }

        setTotalMinutes(total);
        setBreakdown(
          Array.from(byGoal.entries()).map(([goalId, mins]) => ({
            title: goalMap.get(goalId)?.title ?? "Unknown",
            minutes: mins,
          }))
        );
      } catch {
        // silently fail — dashboard still works without this
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return null;
  if (totalMinutes === 0 && breakdown.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-5 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-muted">
        This Week
      </h3>
      <p className="text-3xl font-bold text-foreground">
        {formatDuration(totalMinutes)}
      </p>
      <p className="mb-4 text-xs text-muted-foreground">total study time</p>
      {breakdown.length > 0 && (
        <ul className="space-y-2">
          {breakdown.map((b, i) => (
            <li key={b.title}>
              {i > 0 && <div className="mb-2 border-t border-border" />}
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{b.title}</span>
                <span className="font-medium text-foreground">
                  {formatDuration(b.minutes)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
