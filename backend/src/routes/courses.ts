import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { readData, writeData } from "../storage.js";

const router = Router();

const LETTER_GRADES = ["A", "B", "C", "D", "E", "F"];
const PF_GRADES = ["P", "F"];

// GET /courses
router.get("/", (_req, res) => {
  const data = readData();
  res.json(data.courses);
});

// GET /courses/:id
router.get("/:id", (req, res) => {
  const data = readData();
  const course = data.courses.find((c) => c.id === req.params.id);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json(course);
});

// POST /courses
router.post("/", (req, res) => {
  const { title, gradingMode, grade, credits, goalIds, goalGrades, periodId } = req.body;

  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "title is required" });
    return;
  }
  if (gradingMode !== "letter" && gradingMode !== "pf") {
    res.status(400).json({ error: "gradingMode must be 'letter' or 'pf'" });
    return;
  }
  if (gradingMode === "letter" && !LETTER_GRADES.includes(grade)) {
    res.status(400).json({ error: `grade must be one of ${LETTER_GRADES.join(", ")} for letter grading` });
    return;
  }
  if (gradingMode === "pf" && !PF_GRADES.includes(grade)) {
    res.status(400).json({ error: `grade must be one of ${PF_GRADES.join(", ")} for pass/fail grading` });
    return;
  }
  if (typeof credits !== "number" || credits <= 0) {
    res.status(400).json({ error: "credits must be a positive number" });
    return;
  }

  const data = readData();

  // Validate periodId
  if (periodId !== undefined && periodId !== null) {
    if (!data.periods.find((p) => p.id === periodId)) {
      res.status(400).json({ error: `Period ${periodId} not found` });
      return;
    }
  }

  // Validate goalIds
  const resolvedGoalIds: string[] = goalIds ?? [];
  if (!Array.isArray(resolvedGoalIds)) {
    res.status(400).json({ error: "goalIds must be an array" });
    return;
  }
  for (const gid of resolvedGoalIds) {
    if (!data.goals.find((g) => g.id === gid)) {
      res.status(400).json({ error: `Goal ${gid} not found` });
      return;
    }
    // Check goal isn't already claimed by another course
    const claimedBy = data.courses.find((c) => c.goalIds.includes(gid));
    if (claimedBy) {
      res.status(400).json({ error: `Goal ${gid} is already assigned to course "${claimedBy.title}"` });
      return;
    }
  }

  const { parts } = req.body;

  const course = {
    id: uuidv4(),
    title: title.trim(),
    gradingMode,
    grade,
    credits,
    goalIds: resolvedGoalIds,
    goalGrades: (goalGrades && typeof goalGrades === "object") ? goalGrades : {},
    ...(periodId ? { periodId } : {}),
    ...(Array.isArray(parts) && parts.length > 0 ? { parts } : {}),
    createdAt: new Date().toISOString(),
  };

  data.courses.push(course);
  writeData(data);
  res.status(201).json(course);
});

// PATCH /courses/:id
router.patch("/:id", (req, res) => {
  const { title, gradingMode, grade, credits, goalIds, goalGrades, periodId } = req.body;

  const data = readData();
  const course = data.courses.find((c) => c.id === req.params.id);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  // Backfill goalGrades for older data
  if (!course.goalGrades) course.goalGrades = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({ error: "title must be a non-empty string" });
      return;
    }
    course.title = title.trim();
  }

  if (gradingMode !== undefined) {
    if (gradingMode !== "letter" && gradingMode !== "pf") {
      res.status(400).json({ error: "gradingMode must be 'letter' or 'pf'" });
      return;
    }
    course.gradingMode = gradingMode;
  }

  if (grade !== undefined) {
    const mode = gradingMode ?? course.gradingMode;
    if (mode === "letter" && !LETTER_GRADES.includes(grade)) {
      res.status(400).json({ error: `grade must be one of ${LETTER_GRADES.join(", ")} for letter grading` });
      return;
    }
    if (mode === "pf" && !PF_GRADES.includes(grade)) {
      res.status(400).json({ error: `grade must be one of ${PF_GRADES.join(", ")} for pass/fail grading` });
      return;
    }
    course.grade = grade;
  }

  if (credits !== undefined) {
    if (typeof credits !== "number" || credits <= 0) {
      res.status(400).json({ error: "credits must be a positive number" });
      return;
    }
    course.credits = credits;
  }

  if (goalIds !== undefined) {
    if (!Array.isArray(goalIds)) {
      res.status(400).json({ error: "goalIds must be an array" });
      return;
    }
    for (const gid of goalIds) {
      if (!data.goals.find((g) => g.id === gid)) {
        res.status(400).json({ error: `Goal ${gid} not found` });
        return;
      }
      const claimedBy = data.courses.find((c) => c.id !== course.id && c.goalIds.includes(gid));
      if (claimedBy) {
        res.status(400).json({ error: `Goal ${gid} is already assigned to course "${claimedBy.title}"` });
        return;
      }
    }
    course.goalIds = goalIds;
  }

  if (goalGrades !== undefined) {
    if (typeof goalGrades !== "object" || goalGrades === null) {
      res.status(400).json({ error: "goalGrades must be an object" });
      return;
    }
    course.goalGrades = { ...course.goalGrades, ...goalGrades };
  }

  if (periodId !== undefined) {
    if (periodId === null || periodId === "") {
      delete course.periodId;
    } else {
      if (!data.periods.find((p) => p.id === periodId)) {
        res.status(400).json({ error: `Period ${periodId} not found` });
        return;
      }
      course.periodId = periodId;
    }
  }

  const { parts } = req.body;
  if (parts !== undefined) {
    if (parts === null || (Array.isArray(parts) && parts.length === 0)) {
      course.parts = undefined;
    } else if (Array.isArray(parts)) {
      course.parts = parts;
    }
  }

  writeData(data);
  res.json(course);
});

// DELETE /courses/:id
router.delete("/:id", (req, res) => {
  const data = readData();
  const index = data.courses.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  data.courses.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

export default router;
