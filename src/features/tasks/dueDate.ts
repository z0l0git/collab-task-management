import type { Timestamp } from "firebase/firestore";

import type { Task } from "./types";

const pad = (value: number) => String(value).padStart(2, "0");

export const toDateInputValue = (dueDate: Timestamp | null) => {
  if (!dueDate) return "";
  const date = dueDate.toDate();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const fromDateInputValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

export const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const isOverdue = (task: Pick<Task, "dueDate">, done: boolean) =>
  !done && task.dueDate !== null && task.dueDate.toDate() < startOfToday();

const dueFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const dueFormatWithYear = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export const formatDueDate = (dueDate: Timestamp) => {
  const date = dueDate.toDate();
  return date.getFullYear() === new Date().getFullYear()
    ? dueFormat.format(date)
    : dueFormatWithYear.format(date);
};
