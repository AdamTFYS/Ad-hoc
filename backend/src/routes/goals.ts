import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { readData, writeData } from "../storage.js";
import taskRouter from "./tasks.js";

const router = Router();

// GET /goals
router.get("/", (_req, res) => {
  const data = readData();
  res.json(data.goals);
});

// GET /goals/:id — must be before the .use() so it doesn't get swallowed
router.get("/:id", (req, res) => {
  const data = readData();
  const goal = data.goals.find((g) => g.id === req.params.id);
  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  res.json(goal);
});

// Nest task routes under /goals/:goalId/tasks
router.use("/:goalId/tasks", taskRouter);

// POST /goals
router.post("/", (req, res) => {
  const { title, dueDate } = req.body;
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "title is required and must be a non-empty string" });
    return;
  }
  if (dueDate !== undefined && dueDate !== null) {
    if (typeof dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      res.status(400).json({ error: "dueDate must be in YYYY-MM-DD format" });
      return;
    }
  }

  const data = readData();
  const goal: Record<string, unknown> = {
    id: uuidv4(),
    title: title.trim(),
    tasks: [],
    createdAt: new Date().toISOString(),
  };
  if (dueDate) goal.dueDate = dueDate;
  data.goals.push(goal as typeof data.goals[number]);
  writeData(data);
  res.status(201).json(goal);
});

// PATCH /goals/:id
router.patch("/:id", (req, res) => {
  const { title, dueDate } = req.body;

  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
    res.status(400).json({ error: "title must be a non-empty string" });
    return;
  }
  if (dueDate !== undefined && dueDate !== null) {
    if (typeof dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      res.status(400).json({ error: "dueDate must be in YYYY-MM-DD format" });
      return;
    }
  }

  const data = readData();
  const goal = data.goals.find((g) => g.id === req.params.id);
  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  if (title !== undefined) goal.title = title.trim();
  if (dueDate === null) {
    delete goal.dueDate;
  } else if (dueDate !== undefined) {
    goal.dueDate = dueDate;
  }

  writeData(data);
  res.json(goal);
});

// DELETE /goals/:id
router.delete("/:id", (req, res) => {
  const data = readData();
  const index = data.goals.findIndex((g) => g.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  data.goals.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

export default router;
