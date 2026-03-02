import fs from "node:fs";
import path from "node:path";

export interface StoredSubstep {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface StoredDocument {
  id: string;
  taskId: string;
  filename: string;
  storedFilename: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

export interface StoredTask {
  id: string;
  goalId: string;
  title: string;
  weight: number;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  substeps?: StoredSubstep[];
  documents?: StoredDocument[];
}

export interface StoredGoal {
  id: string;
  title: string;
  dueDate?: string;
  tasks: StoredTask[];
  createdAt: string;
}

export interface StoredSession {
  id: string;
  taskId: string;
  goalId: string;
  date: string;
  startTime: string;
  endTime: string;
  title?: string;
  notes?: string;
  createdAt: string;
}

export interface StoredCoursePart {
  id: string;
  name: string;
  credits: number;
  gradingMode: "letter" | "pf";
  grade: string;
  periodId?: string;
}

export interface StoredCourse {
  id: string;
  title: string;
  gradingMode: "letter" | "pf";
  grade: string;
  credits: number;
  goalIds: string[];
  goalGrades: Record<string, string>;
  periodId?: string;
  parts?: StoredCoursePart[];
  createdAt: string;
}

export interface StoredSemester {
  id: string;
  name: string;
  year: number;
  order: number;
  createdAt: string;
}

export interface StoredPeriod {
  id: string;
  semesterId: string;
  name: string;
  order: number;
  createdAt: string;
}

export interface StoredData {
  goals: StoredGoal[];
  sessions: StoredSession[];
  courses: StoredCourse[];
  semesters: StoredSemester[];
  periods: StoredPeriod[];
}

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "goals.json");

export function readData(): StoredData {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw) as StoredData;
    if (!data.sessions) data.sessions = [];
    if (!data.courses) data.courses = [];
    if (!data.semesters) data.semesters = [];
    if (!data.periods) data.periods = [];
    return data;
  } catch {
    return { goals: [], sessions: [], courses: [], semesters: [], periods: [] };
  }
}

export function writeData(data: StoredData): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, DATA_FILE);
}
