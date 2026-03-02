"use client";

import { useState } from "react";
import type { Goal, Course, Semester, Period, GradingMode, LetterGrade, PassFailGrade, CreateCoursePayload } from "@/types";
import { computeProgress } from "@/lib/progress";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type CreateCourseModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateCoursePayload) => void;
  goals: Goal[];
  existingCourses: Course[];
  semesters?: Semester[];
  periods?: Period[];
  defaultPeriodId?: string;
};

const LETTER_GRADES: LetterGrade[] = ["A", "B", "C", "D", "E", "F"];
const PF_GRADES: PassFailGrade[] = ["P", "F"];

function isGoalCompleted(goal: Goal): boolean {
  return goal.tasks.length > 0 && goal.tasks.every((t) => t.completed);
}

export default function CreateCourseModal({
  open,
  onClose,
  onCreate,
  goals,
  existingCourses,
  semesters = [],
  periods = [],
  defaultPeriodId,
}: CreateCourseModalProps) {
  const [title, setTitle] = useState("");
  const [credits, setCredits] = useState("1");
  const [gradingMode, setGradingMode] = useState<GradingMode>("letter");
  const [grade, setGrade] = useState<string>("A");
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(defaultPeriodId ?? "");
  const [error, setError] = useState("");

  // Goals that are completed and not already assigned to another course
  const claimedGoalIds = new Set(existingCourses.flatMap((c) => c.goalIds));
  const availableGoals = goals.filter(
    (g) => isGoalCompleted(g) && !claimedGoalIds.has(g.id)
  );

  function handleGradingModeChange(mode: GradingMode) {
    setGradingMode(mode);
    setGrade(mode === "letter" ? "A" : "P");
  }

  function toggleGoal(goalId: string) {
    setSelectedGoalIds((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required");
      return;
    }
    const creditsNum = Number(credits);
    if (!creditsNum || creditsNum <= 0) {
      setError("Credits must be a positive number");
      return;
    }
    setError("");
    onCreate({
      title: trimmed,
      gradingMode,
      grade: grade as LetterGrade | PassFailGrade,
      credits: creditsNum,
      goalIds: selectedGoalIds.length > 0 ? selectedGoalIds : undefined,
      periodId: selectedPeriodId || undefined,
    });
    resetForm();
  }

  function resetForm() {
    setTitle("");
    setCredits("1");
    setGradingMode("letter");
    setGrade("A");
    setSelectedGoalIds([]);
    setSelectedPeriodId(defaultPeriodId ?? "");
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const gradeOptions = gradingMode === "letter" ? LETTER_GRADES : PF_GRADES;

  return (
    <Modal open={open} onClose={handleClose}>
      <h2 className="mb-5 text-lg font-semibold text-foreground">New Course</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Course title"
          id="course-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Linear Algebra"
          error={error}
          autoFocus
        />

        <Input
          label="Credits"
          id="course-credits"
          type="number"
          min="0.5"
          step="0.5"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
        />

        {/* Grading mode toggle */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted">Grading mode</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors ${
                gradingMode === "letter"
                  ? "bg-accent text-white"
                  : "bg-surface-1 text-muted hover:text-foreground"
              }`}
              onClick={() => handleGradingModeChange("letter")}
            >
              Letter (A–F)
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors ${
                gradingMode === "pf"
                  ? "bg-accent text-white"
                  : "bg-surface-1 text-muted hover:text-foreground"
              }`}
              onClick={() => handleGradingModeChange("pf")}
            >
              Pass / Fail
            </button>
          </div>
        </div>

        {/* Grade selector */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted">Grade</span>
          <div className="flex gap-1.5 flex-wrap">
            {gradeOptions.map((g) => (
              <button
                key={g}
                type="button"
                className={`rounded-md px-3 py-1 text-sm font-semibold transition-colors border ${
                  grade === g
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface-1 text-muted hover:text-foreground"
                }`}
                onClick={() => setGrade(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Period selector */}
        {semesters.length > 0 && (
          <div className="flex flex-col gap-1">
            <label htmlFor="course-period" className="text-sm font-medium text-muted">
              Period (optional)
            </label>
            <select
              id="course-period"
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground shadow-sm transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">Unassigned</option>
              {semesters
                .sort((a, b) => a.order - b.order)
                .map((sem) => {
                  const semPeriods = periods
                    .filter((p) => p.semesterId === sem.id)
                    .sort((a, b) => a.order - b.order);
                  return (
                    <optgroup key={sem.id} label={`${sem.name} — Year ${sem.year}`}>
                      {semPeriods.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
            </select>
          </div>
        )}

        {/* Goal picker */}
        {availableGoals.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted">
              Assign completed goals (optional)
            </span>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-surface-2/50 p-2 flex flex-col gap-1">
              {availableGoals.map((goal) => {
                const selected = selectedGoalIds.includes(goal.id);
                const progress = computeProgress(goal.tasks);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      selected
                        ? "bg-accent/10 text-accent"
                        : "text-foreground hover:bg-surface-2"
                    }`}
                    onClick={() => toggleGoal(goal.id)}
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded border text-xs ${
                      selected ? "border-accent bg-accent text-white" : "border-border"
                    }`}>
                      {selected ? "✓" : ""}
                    </span>
                    <span className="flex-1 truncate">{goal.title}</span>
                    <span className="text-xs text-muted tabular-nums">{Math.round(progress * 100)}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </div>
      </form>
    </Modal>
  );
}
