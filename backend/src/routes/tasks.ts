import { Router, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { readData, writeData } from "../storage.js";
import substepRouter from "./substeps.js";
import documentRouter from "./documents.js";

type GoalParams = { goalId: string };
type TaskParams = { goalId: string; taskId: string };

const router = Router({ mergeParams: true });

// PUT /goals/:goalId/tasks/reorder — must be before /:taskId routes
router.put("/reorder", (req: Request<GoalParams>, res) => {
  const { goalId } = req.params;
  const { taskIds } = req.body;

  if (!Array.isArray(taskIds) || taskIds.some((id: unknown) => typeof id !== "string")) {
    res.status(400).json({ error: "taskIds must be an array of strings" });
    return;
  }

  const data = readData();
  const goal = data.goals.find((g) => g.id === goalId);
  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  const existingIds = new Set(goal.tasks.map((t) => t.id));
  const incomingIds = new Set(taskIds as string[]);
  if (existingIds.size !== incomingIds.size || ![...existingIds].every((id) => incomingIds.has(id))) {
    res.status(400).json({ error: "taskIds must contain exactly all task IDs for this goal" });
    return;
  }

  const taskMap = new Map(goal.tasks.map((t) => [t.id, t]));
  goal.tasks = (taskIds as string[]).map((id) => taskMap.get(id)!);
  writeData(data);
  res.json(goal.tasks);
});

// Nest substep and document routes
router.use("/:taskId/substeps", substepRouter);
router.use("/:taskId/documents", documentRouter);

// POST /goals/:goalId/tasks
router.post("/", (req: Request<GoalParams>, res) => {
  const { goalId } = req.params;
  const { title, weight, dueDate } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "title is required and must be a non-empty string" });
    return;
  }
  if (typeof weight !== "number" || weight <= 0) {
    res.status(400).json({ error: "weight is required and must be a positive number" });
    return;
  }
  if (dueDate !== undefined && dueDate !== null) {
    if (typeof dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      res.status(400).json({ error: "dueDate must be in YYYY-MM-DD format" });
      return;
    }
  }

  const data = readData();
  const goal = data.goals.find((g) => g.id === goalId);
  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  const task: Record<string, unknown> = {
    id: uuidv4(),
    goalId,
    title: title.trim(),
    weight,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  if (dueDate) task.dueDate = dueDate;
  goal.tasks.push(task as typeof goal.tasks[number]);
  writeData(data);
  res.status(201).json(task);
});

// PATCH /goals/:goalId/tasks/:taskId
router.patch("/:taskId", (req: Request<TaskParams>, res) => {
  const { goalId, taskId } = req.params;
  const { title, weight, completed, dueDate } = req.body;

  // Validate optional fields if provided
  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
    res.status(400).json({ error: "title must be a non-empty string" });
    return;
  }
  if (weight !== undefined && (typeof weight !== "number" || weight <= 0)) {
    res.status(400).json({ error: "weight must be a positive number" });
    return;
  }
  if (completed !== undefined && typeof completed !== "boolean") {
    res.status(400).json({ error: "completed must be a boolean" });
    return;
  }
  if (dueDate !== undefined && dueDate !== null) {
    if (typeof dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      res.status(400).json({ error: "dueDate must be in YYYY-MM-DD format" });
      return;
    }
  }

  const data = readData();
  const goal = data.goals.find((g) => g.id === goalId);
  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  const task = goal.tasks.find((t) => t.id === taskId);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  if (title !== undefined) task.title = title.trim();
  if (weight !== undefined) task.weight = weight;
  if (completed !== undefined) task.completed = completed;
  if (dueDate === null) {
    delete task.dueDate;
  } else if (dueDate !== undefined) {
    task.dueDate = dueDate;
  }

  writeData(data);
  res.json(task);
});

// DELETE /goals/:goalId/tasks/:taskId
router.delete("/:taskId", (req: Request<TaskParams>, res) => {
  const { goalId, taskId } = req.params;

  const data = readData();
  const goal = data.goals.find((g) => g.id === goalId);
  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  const index = goal.tasks.findIndex((t) => t.id === taskId);
  if (index === -1) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  goal.tasks.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

export default router;
