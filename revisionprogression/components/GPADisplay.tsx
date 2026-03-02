import type { Course, LetterGrade } from "@/types";
import { GRADE_VALUES } from "@/types";

type GPADisplayProps = {
  courses: Course[];
  label?: string;
  compact?: boolean;
  periodId?: string;
};

function computeGPA(courses: Course[], periodId?: string) {
  let weightedSum = 0;
  let totalCredits = 0;
  let courseCount = 0;

  for (const c of courses) {
    if (c.parts && c.parts.length > 0) {
      // Use parts for GPA
      const relevantParts = periodId
        ? c.parts.filter((p) => p.periodId === periodId)
        : c.parts;
      for (const part of relevantParts) {
        if (part.gradingMode === "letter") {
          const val = GRADE_VALUES[part.grade as LetterGrade] ?? 0;
          weightedSum += val * part.credits;
          totalCredits += part.credits;
        }
      }
      if (relevantParts.length > 0) courseCount++;
    } else {
      // Use course-level values
      if (c.gradingMode === "letter") {
        const val = GRADE_VALUES[c.grade as LetterGrade] ?? 0;
        weightedSum += val * c.credits;
        totalCredits += c.credits;
      }
      courseCount++;
    }
  }

  const gpa = totalCredits > 0 ? weightedSum / totalCredits : 0;
  return { gpa, totalCredits, courseCount };
}

export default function GPADisplay({ courses, label, compact, periodId }: GPADisplayProps) {
  const { gpa, totalCredits, courseCount } = computeGPA(courses, periodId);

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted">
        <span className="font-medium text-foreground">{label ?? "GPA"}:</span>
        <span className="font-bold tabular-nums bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          {totalCredits > 0 ? gpa.toFixed(2) : "—"}
        </span>
      </span>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label ?? "Weighted GPA"}</p>
          <p className="mt-1 text-3xl font-bold tabular-nums bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            {totalCredits > 0 ? gpa.toFixed(2) : "—"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted">
            {courseCount} course{courseCount !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-muted">
            {totalCredits} credit{totalCredits !== 1 ? "s" : ""} (letter-graded)
          </p>
        </div>
      </div>
    </div>
  );
}
