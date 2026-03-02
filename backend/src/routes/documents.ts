import { Router, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { readData, writeData } from "../storage.js";

type DocParams = { goalId: string; taskId: string; docId: string };

const UPLOADS_DIR = path.join(__dirname, "..", "..", "data", "uploads");

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const ALLOWED_MIMES = ["application/pdf", "image/png", "image/jpeg"];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, PNG, and JPEG files are allowed"));
    }
  },
});

const router = Router({ mergeParams: true });

// POST /goals/:goalId/tasks/:taskId/documents
router.post(
  "/",
  upload.single("file"),
  (req: Request<{ goalId: string; taskId: string }>, res) => {
    const { goalId, taskId } = req.params;

    if (!req.file) {
      res.status(400).json({ error: "file is required" });
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

    if (!task.documents) task.documents = [];

    const doc = {
      id: uuidv4(),
      taskId,
      filename: req.file.originalname,
      storedFilename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
    };
    task.documents.push(doc);
    writeData(data);
    res.status(201).json(doc);
  }
);

// DELETE /goals/:goalId/tasks/:taskId/documents/:docId
router.delete("/:docId", (req: Request<DocParams>, res) => {
  const { goalId, taskId, docId } = req.params;

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

  const documents = task.documents ?? [];
  const index = documents.findIndex((d) => d.id === docId);
  if (index === -1) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  const [removed] = documents.splice(index, 1);
  task.documents = documents;

  // Remove the physical file
  const filePath = path.join(UPLOADS_DIR, removed.storedFilename);
  try {
    fs.unlinkSync(filePath);
  } catch {
    // File may already be gone — continue
  }

  writeData(data);
  res.status(204).send();
});

export default router;
