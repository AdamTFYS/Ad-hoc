import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { readData, writeData } from "../storage.js";

const router = Router();

// GET /periods — optional ?semesterId filter
router.get("/", (req, res) => {
  const data = readData();
  const semesterId = req.query.semesterId as string | undefined;
  if (semesterId) {
    res.json(data.periods.filter((p) => p.semesterId === semesterId));
  } else {
    res.json(data.periods);
  }
});

// POST /periods
router.post("/", (req, res) => {
  const { semesterId, name } = req.body;

  if (!semesterId || typeof semesterId !== "string") {
    res.status(400).json({ error: "semesterId is required" });
    return;
  }
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const data = readData();

  if (!data.semesters.find((s) => s.id === semesterId)) {
    res.status(400).json({ error: "Semester not found" });
    return;
  }

  const siblingPeriods = data.periods.filter((p) => p.semesterId === semesterId);
  const maxOrder = siblingPeriods.reduce((max, p) => Math.max(max, p.order), 0);

  const period = {
    id: uuidv4(),
    semesterId,
    name: name.trim(),
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };

  data.periods.push(period);
  writeData(data);
  res.status(201).json(period);
});

// PATCH /periods/:id
router.patch("/:id", (req, res) => {
  const { name, order } = req.body;

  const data = readData();
  const period = data.periods.find((p) => p.id === req.params.id);
  if (!period) {
    res.status(404).json({ error: "Period not found" });
    return;
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "name must be a non-empty string" });
      return;
    }
    period.name = name.trim();
  }

  if (order !== undefined) {
    if (typeof order !== "number") {
      res.status(400).json({ error: "order must be a number" });
      return;
    }
    period.order = order;
  }

  writeData(data);
  res.json(period);
});

// DELETE /periods/:id — unassign courses in that period
router.delete("/:id", (req, res) => {
  const data = readData();
  const index = data.periods.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Period not found" });
    return;
  }

  // Unassign courses belonging to this period
  for (const course of data.courses) {
    if (course.periodId === req.params.id) {
      delete course.periodId;
    }
  }

  data.periods.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

export default router;
