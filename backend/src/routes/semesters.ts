import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { readData, writeData } from "../storage.js";

const router = Router();

// GET /semesters
router.get("/", (_req, res) => {
  const data = readData();
  res.json(data.semesters);
});

// POST /semesters
router.post("/", (req, res) => {
  const { name, year } = req.body;

  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "name is required" });
    return;
  }
  if (typeof year !== "number" || year <= 0) {
    res.status(400).json({ error: "year must be a positive number" });
    return;
  }

  const data = readData();
  const maxOrder = data.semesters.reduce((max, s) => Math.max(max, s.order), 0);

  const semester = {
    id: uuidv4(),
    name: name.trim(),
    year,
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };

  data.semesters.push(semester);
  writeData(data);
  res.status(201).json(semester);
});

// PATCH /semesters/:id
router.patch("/:id", (req, res) => {
  const { name, year, order } = req.body;

  const data = readData();
  const semester = data.semesters.find((s) => s.id === req.params.id);
  if (!semester) {
    res.status(404).json({ error: "Semester not found" });
    return;
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "name must be a non-empty string" });
      return;
    }
    semester.name = name.trim();
  }

  if (year !== undefined) {
    if (typeof year !== "number" || year <= 0) {
      res.status(400).json({ error: "year must be a positive number" });
      return;
    }
    semester.year = year;
  }

  if (order !== undefined) {
    if (typeof order !== "number") {
      res.status(400).json({ error: "order must be a number" });
      return;
    }
    semester.order = order;
  }

  writeData(data);
  res.json(semester);
});

// DELETE /semesters/:id — cascade: remove child periods, unassign their courses
router.delete("/:id", (req, res) => {
  const data = readData();
  const index = data.semesters.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Semester not found" });
    return;
  }

  // Find all periods belonging to this semester
  const periodIds = new Set(
    data.periods.filter((p) => p.semesterId === req.params.id).map((p) => p.id)
  );

  // Unassign courses that belong to these periods
  for (const course of data.courses) {
    if (course.periodId && periodIds.has(course.periodId)) {
      delete course.periodId;
    }
  }

  // Remove the periods
  data.periods = data.periods.filter((p) => p.semesterId !== req.params.id);

  // Remove the semester
  data.semesters.splice(index, 1);

  writeData(data);
  res.status(204).send();
});

export default router;
