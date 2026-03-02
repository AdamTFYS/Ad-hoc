import type {
  Goal,
  Task,
  Substep,
  TaskDocument,
  StudySession,
  Course,
  Semester,
  Period,
  CreateGoalPayload,
  UpdateGoalPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateSubstepPayload,
  UpdateSubstepPayload,
  CreateSessionPayload,
  UpdateSessionPayload,
  CreateCoursePayload,
  UpdateCoursePayload,
  CreateSemesterPayload,
  UpdateSemesterPayload,
  CreatePeriodPayload,
  UpdatePeriodPayload,
} from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getGoals: () => request<Goal[]>("/goals"),

  getGoal: (goalId: string) => request<Goal>(`/goals/${goalId}`),

  createGoal: (payload: CreateGoalPayload) =>
    request<Goal>("/goals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateGoal: (goalId: string, payload: UpdateGoalPayload) =>
    request<Goal>(`/goals/${goalId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteGoal: (id: string) =>
    request<void>(`/goals/${id}`, { method: "DELETE" }),

  createTask: (goalId: string, payload: Omit<CreateTaskPayload, "goalId">) =>
    request<Task>(`/goals/${goalId}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTask: (goalId: string, taskId: string, payload: UpdateTaskPayload) =>
    request<Task>(`/goals/${goalId}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteTask: (goalId: string, taskId: string) =>
    request<void>(`/goals/${goalId}/tasks/${taskId}`, { method: "DELETE" }),

  reorderTasks: (goalId: string, taskIds: string[]) =>
    request<Task[]>(`/goals/${goalId}/tasks/reorder`, {
      method: "PUT",
      body: JSON.stringify({ taskIds }),
    }),

  // Substeps
  createSubstep: (goalId: string, taskId: string, payload: CreateSubstepPayload) =>
    request<Substep>(`/goals/${goalId}/tasks/${taskId}/substeps`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateSubstep: (goalId: string, taskId: string, substepId: string, payload: UpdateSubstepPayload) =>
    request<Substep>(`/goals/${goalId}/tasks/${taskId}/substeps/${substepId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteSubstep: (goalId: string, taskId: string, substepId: string) =>
    request<void>(`/goals/${goalId}/tasks/${taskId}/substeps/${substepId}`, { method: "DELETE" }),

  // Documents
  async uploadDocument(goalId: string, taskId: string, file: File): Promise<TaskDocument> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/goals/${goalId}/tasks/${taskId}/documents`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },

  deleteDocument: (goalId: string, taskId: string, docId: string) =>
    request<void>(`/goals/${goalId}/tasks/${taskId}/documents/${docId}`, { method: "DELETE" }),

  // Sessions
  getSessions: (params?: { month?: string; date?: string }) => {
    const query = new URLSearchParams();
    if (params?.month) query.set("month", params.month);
    if (params?.date) query.set("date", params.date);
    const qs = query.toString();
    return request<StudySession[]>(`/sessions${qs ? `?${qs}` : ""}`);
  },

  createSession: (payload: CreateSessionPayload) =>
    request<StudySession>("/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateSession: (id: string, payload: UpdateSessionPayload) =>
    request<StudySession>(`/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteSession: (id: string) =>
    request<void>(`/sessions/${id}`, { method: "DELETE" }),

  // Courses
  getCourses: () => request<Course[]>("/courses"),

  createCourse: (payload: CreateCoursePayload) =>
    request<Course>("/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCourse: (id: string, payload: UpdateCoursePayload) =>
    request<Course>(`/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteCourse: (id: string) =>
    request<void>(`/courses/${id}`, { method: "DELETE" }),

  // Semesters
  getSemesters: () => request<Semester[]>("/semesters"),

  createSemester: (payload: CreateSemesterPayload) =>
    request<Semester>("/semesters", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateSemester: (id: string, payload: UpdateSemesterPayload) =>
    request<Semester>(`/semesters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteSemester: (id: string) =>
    request<void>(`/semesters/${id}`, { method: "DELETE" }),

  // Periods
  getPeriods: (semesterId?: string) => {
    const qs = semesterId ? `?semesterId=${semesterId}` : "";
    return request<Period[]>(`/periods${qs}`);
  },

  createPeriod: (payload: CreatePeriodPayload) =>
    request<Period>("/periods", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updatePeriod: (id: string, payload: UpdatePeriodPayload) =>
    request<Period>(`/periods/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deletePeriod: (id: string) =>
    request<void>(`/periods/${id}`, { method: "DELETE" }),
};
