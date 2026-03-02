import { Router, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { readData, writeData } from "../storage.js";

type SubstepParams = { goalId: string; taskId: string; substepId: string };

const router = Router({ mergeParams: true });

// POST /goals/:goalId/tasks/:taskId/substeps
router.post("/", (req: Request<{ goalId: string; taskId: string }>, res) => {
  const { goalId, taskId } = req.params;
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "title is required and must be a non-empty string" });
    return;
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

  if (!task.substeps) task.substeps = [];

  const substep = {
    id: uuidv4(),
    taskId,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  task.substeps.push(substep);
  writeData(data);
  res.status(201).json(substep);
});

// PATCH /goals/:goalId/tasks/:taskId/substeps/:substepId
router.patch("/:substepId", (req: Request<SubstepParams>, res) => {
  const { goalId, taskId, substepId } = req.params;
  const { title, completed } = req.body;

  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
    res.status(400).json({ error: "title must be a non-empty string" });
    return;
  }
  if (completed !== undefined && typeof completed !== "boolean") {
    res.status(400).json({ error: "completed must be a boolean" });
    return;
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

  const substep = (task.substeps ?? []).find((s) => s.id === substepId);
  if (!substep) {
    res.status(404).json({ error: "Substep not found" });
    return;
  }

  if (title !== undefined) substep.title = title.trim();
  if (completed !== undefined) substep.completed = completed;

  writeData(data);
  res.json(substep);
});

// DELETE /goals/:goalId/tasks/:taskId/substeps/:substepId
router.delete("/:substepId", (req: Request<SubstepParams>, res) => {
  const { goalId, taskId, substepId } = req.params;

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

  const substeps = task.substeps ?? [];
  const index = substeps.findIndex((s) => s.id === substepId);
  if (index === -1) {
    res.status(404).json({ error: "Substep not found" });
    return;
  }

  substeps.splice(index, 1);
  task.substeps = substeps;
  writeData(data);
  res.status(204).send();
});

export default router;
