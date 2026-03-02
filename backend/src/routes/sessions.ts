import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { readData, writeData } from "../storage.js";

const router = Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

// GET /sessions?month=YYYY-MM or ?date=YYYY-MM-DD
router.get("/", (req, res) => {
  const data = readData();
  const { month, date } = req.query;

  let sessions = data.sessions;
  if (typeof date === "string" && DATE_RE.test(date)) {
    sessions = sessions.filter((s) => s.date === date);
  } else if (typeof month === "string" && /^\d{4}-\d{2}$/.test(month)) {
    sessions = sessions.filter((s) => s.date.startsWith(month));
  }

  res.json(sessions);
});

// POST /sessions
router.post("/", (req, res) => {
  const { taskId, goalId, date, startTime, endTime, title, notes } = req.body;

  if (!goalId || typeof goalId !== "string") {
    res.status(400).json({ error: "goalId is required" });
    return;
  }
  if (!taskId || typeof taskId !== "string") {
    res.status(400).json({ error: "taskId is required" });
    return;
  }
  if (!date || typeof date !== "string" || !DATE_RE.test(date)) {
    res.status(400).json({ error: "date is required in YYYY-MM-DD format" });
    return;
  }
  if (!startTime || typeof startTime !== "string" || !TIME_RE.test(startTime)) {
    res.status(400).json({ error: "startTime is required in HH:MM format" });
    return;
  }
  if (!endTime || typeof endTime !== "string" || !TIME_RE.test(endTime)) {
    res.status(400).json({ error: "endTime is required in HH:MM format" });
    return;
  }
  if (endTime <= startTime) {
    res.status(400).json({ error: "endTime must be after startTime" });
    return;
  }

  const data = readData();

  // Validate goalId and taskId exist
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

  const session = {
    id: uuidv4(),
    taskId,
    goalId,
    date,
    startTime,
    endTime,
    ...(title ? { title } : {}),
    ...(notes ? { notes } : {}),
    createdAt: new Date().toISOString(),
  };

  data.sessions.push(session);
  writeData(data);
  res.status(201).json(session);
});

// PATCH /sessions/:id
router.patch("/:id", (req, res) => {
  const { date, startTime, endTime, title, notes } = req.body;

  if (date !== undefined && (typeof date !== "string" || !DATE_RE.test(date))) {
    res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
    return;
  }
  if (startTime !== undefined && (typeof startTime !== "string" || !TIME_RE.test(startTime))) {
    res.status(400).json({ error: "startTime must be in HH:MM format" });
    return;
  }
  if (endTime !== undefined && (typeof endTime !== "string" || !TIME_RE.test(endTime))) {
    res.status(400).json({ error: "endTime must be in HH:MM format" });
    return;
  }

  const data = readData();
  const session = data.sessions.find((s) => s.id === req.params.id);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  if (date !== undefined) session.date = date;
  if (startTime !== undefined) session.startTime = startTime;
  if (endTime !== undefined) session.endTime = endTime;
  if (title !== undefined) session.title = title;
  if (notes !== undefined) session.notes = notes;

  // Validate endTime > startTime after updates
  if (session.endTime <= session.startTime) {
    res.status(400).json({ error: "endTime must be after startTime" });
    return;
  }

  writeData(data);
  res.json(session);
});

// DELETE /sessions/:id
router.delete("/:id", (req, res) => {
  const data = readData();
  const index = data.sessions.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  data.sessions.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

export default router;
