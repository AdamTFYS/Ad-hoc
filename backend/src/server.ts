import express from "express";
import cors from "cors";
import path from "node:path";
import goalRouter from "./routes/goals.js";
import sessionRouter from "./routes/sessions.js";
import courseRouter from "./routes/courses.js";
import semesterRouter from "./routes/semesters.js";
import periodRouter from "./routes/periods.js";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "..", "data", "uploads")));
app.use("/goals", goalRouter);
app.use("/sessions", sessionRouter);
app.use("/courses", courseRouter);
app.use("/semesters", semesterRouter);
app.use("/periods", periodRouter);

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
