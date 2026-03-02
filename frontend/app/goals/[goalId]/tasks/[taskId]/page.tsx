"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { computeSubstepProgress } from "@/lib/progress";
import type { Goal, Task, Substep, TaskDocument, StudySession } from "@/types";
import ProgressBar from "@/components/ProgressBar";
import SubstepItem from "@/components/SubstepItem";
import AddSubstepForm from "@/components/AddSubstepForm";
import DocumentList from "@/components/DocumentList";
import FileUpload from "@/components/FileUpload";
import SessionTimer from "@/components/SessionTimer";
import AddSessionForm from "@/components/AddSessionForm";
import SessionList from "@/components/SessionList";

const UPLOADS_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function ShimmerBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-shimmer rounded-lg ${className}`} />;
}

export default function TaskRoomPage() {
  const params = useParams<{ goalId: string; taskId: string }>();
  const router = useRouter();
  const { goalId, taskId } = params;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [substeps, setSubsteps] = useState<Substep[]>([]);
  const [documents, setDocuments] = useState<TaskDocument[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const g = await api.getGoal(goalId);
      setGoal(g);
      const t = g.tasks.find((t) => t.id === taskId);
      if (!t) {
        setError("Task not found");
        return;
      }
      setTask(t);
      setSubsteps(t.substeps ?? []);
      setDocuments(t.documents ?? []);
      const allSessions = await api.getSessions();
      setSessions(allSessions.filter((s) => s.taskId === taskId));
    } catch {
      setError("Failed to load task");
    } finally {
      setLoading(false);
    }
  }, [goalId, taskId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAddSubstep(title: string) {
    const substep = await api.createSubstep(goalId, taskId, { title });
    setSubsteps((prev) => [...prev, substep]);
  }

  async function handleToggleSubstep(substep: Substep) {
    const updated = await api.updateSubstep(goalId, taskId, substep.id, {
      completed: !substep.completed,
    });
    setSubsteps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  async function handleDeleteSubstep(substepId: string) {
    await api.deleteSubstep(goalId, taskId, substepId);
    setSubsteps((prev) => prev.filter((s) => s.id !== substepId));
  }

  async function handleUploadDocument(file: File) {
    const doc = await api.uploadDocument(goalId, taskId, file);
    setDocuments((prev) => [...prev, doc]);
  }

  async function handleDeleteDocument(docId: string) {
    await api.deleteDocument(goalId, taskId, docId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <ShimmerBlock className="mb-6 h-4 w-48" />
        <ShimmerBlock className="mb-4 h-8 w-2/3" />
        <ShimmerBlock className="mb-8 h-2 w-full" />
        <ShimmerBlock className="mb-3 h-5 w-24" />
        <div className="space-y-2 mb-8">
          <ShimmerBlock className="h-8 w-full" />
          <ShimmerBlock className="h-8 w-full" />
          <ShimmerBlock className="h-8 w-5/6" />
        </div>
        <ShimmerBlock className="mb-3 h-5 w-28" />
        <ShimmerBlock className="h-20 w-full" />
      </div>
    );
  }

  if (error || !goal || !task) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error || "Something went wrong"}</p>
        <button onClick={() => router.push("/")} className="text-accent hover:underline text-sm">
          Back to dashboard
        </button>
      </div>
    );
  }

  const progress = computeSubstepProgress(substeps);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-foreground transition-colors">
          &larr; Back
        </Link>
        <span>/</span>
        <span className="truncate">{goal.title}</span>
        <span>/</span>
        <span className="truncate text-foreground">{task.title}</span>
      </div>

      {/* Task title */}
      <h1 className="mb-4 text-2xl font-bold text-foreground">
        {task.title}
      </h1>

      {/* Progress */}
      <div className="mb-8">
        <ProgressBar value={progress} />
      </div>

      {/* Sub-steps section */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Sub-steps
        </h2>
        <div className="border-b border-border mb-3" />
        <div className="flex flex-col gap-1 mb-3">
          {substeps.map((s) => (
            <SubstepItem
              key={s.id}
              substep={s}
              onToggle={handleToggleSubstep}
              onDelete={handleDeleteSubstep}
            />
          ))}
        </div>
        <AddSubstepForm onAdd={handleAddSubstep} />
      </section>

      {/* Documents section */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Documents
        </h2>
        <div className="border-b border-border mb-3" />
        <div className="mb-3">
          <DocumentList
            documents={documents}
            uploadsBaseUrl={`${UPLOADS_BASE}/uploads`}
            onDelete={handleDeleteDocument}
          />
        </div>
        <FileUpload onUpload={handleUploadDocument} />
      </section>

      {/* Study Sessions section */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Study Sessions
        </h2>
        <div className="border-b border-border mb-3" />
        <div className="mb-3">
          <SessionTimer
            taskId={taskId}
            goalId={goalId}
            onSessionCreated={(s) => setSessions((prev) => [...prev, s])}
          />
        </div>
        <div className="mb-3">
          <AddSessionForm
            taskId={taskId}
            goalId={goalId}
            onSessionCreated={(s) => setSessions((prev) => [...prev, s])}
          />
        </div>
        <SessionList
          sessions={sessions}
          onDelete={(id) => setSessions((prev) => prev.filter((s) => s.id !== id))}
        />
      </section>
    </div>
  );
}
