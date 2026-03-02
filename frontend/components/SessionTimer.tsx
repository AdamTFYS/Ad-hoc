"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { todayISO } from "@/lib/dates";
import type { StudySession } from "@/types";
import Button from "@/components/ui/Button";

type SessionTimerProps = {
  taskId: string;
  goalId: string;
  onSessionCreated: (session: StudySession) => void;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function nowHHMM(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SessionTimer({ taskId, goalId, onSessionCreated }: SessionTimerProps) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const startRef = useRef<string>("");
  const startMsRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function handleStart() {
    startRef.current = nowHHMM();
    startMsRef.current = Date.now();
    setElapsed(0);
    setError("");
    setRunning(true);
    const startMs = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startMs) / 1000));
    }, 1000);
  }

  async function handleStop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Compute endTime: if less than a minute elapsed, bump endTime by 1 minute
    // so the backend doesn't reject startTime == endTime
    let endTime = nowHHMM();
    if (endTime <= startRef.current) {
      const [h, m] = startRef.current.split(":").map(Number);
      const total = h * 60 + m + 1;
      endTime = `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
    }

    setRunning(false);
    setSaving(true);
    try {
      const session = await api.createSession({
        taskId,
        goalId,
        date: todayISO(),
        startTime: startRef.current,
        endTime,
      });
      onSessionCreated(session);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save session");
    } finally {
      setSaving(false);
      setElapsed(0);
    }
  }

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        {running ? (
          <>
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse-dot" />
            <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
              {pad(mins)}:{pad(secs)}
            </span>
            <Button variant="danger" onClick={handleStop} disabled={saving}>
              {saving ? "Saving..." : "Stop"}
            </Button>
          </>
        ) : (
          <Button onClick={handleStart}>Start Studying</Button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
