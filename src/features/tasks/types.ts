import type { Timestamp } from "firebase/firestore";

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In progress",
  done: "Done",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const TASK_LIMITS = {
  title: 200,
  description: 5000,
  labels: 10,
} as const;

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: Timestamp | null;
  labels: string[];
  order: number;
  createdBy: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type TaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: Date | null;
  labels: string[];
};

export const isTaskStatus = (value: unknown): value is TaskStatus =>
  TASK_STATUSES.includes(value as TaskStatus);

export const isTaskPriority = (value: unknown): value is TaskPriority =>
  TASK_PRIORITIES.includes(value as TaskPriority);

export type Assignee = { displayName: string; photoURL: string | null };

const FORMER_MEMBER: Assignee = {
  displayName: "Former member",
  photoURL: null,
};

export const assigneeOf = (
  members: Record<string, Assignee>,
  uid: string | null,
) => (uid ? (members[uid] ?? FORMER_MEMBER) : null);
