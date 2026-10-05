import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase";

import type { TaskInput, TaskStatus } from "./types";

export const tasksRef = (workspaceId: string) =>
  collection(getFirebaseDb(), "workspaces", workspaceId, "tasks");

const taskRef = (workspaceId: string, taskId: string) =>
  doc(getFirebaseDb(), "workspaces", workspaceId, "tasks", taskId);

const toFields = (input: TaskInput) => ({
  title: input.title.trim(),
  description: input.description.trim(),
  status: input.status,
  priority: input.priority,
  assigneeId: input.assigneeId,
  dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
  labels: input.labels,
});

export const createTask = async (
  workspaceId: string,
  uid: string,
  input: TaskInput,
) => {
  const created = await addDoc(tasksRef(workspaceId), {
    ...toFields(input),
    order: Date.now(),
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
};

export const updateTask = (
  workspaceId: string,
  taskId: string,
  input: TaskInput,
) =>
  updateDoc(taskRef(workspaceId, taskId), {
    ...toFields(input),
    updatedAt: serverTimestamp(),
  });

export const updateTaskFields = (
  workspaceId: string,
  taskId: string,
  fields: Partial<TaskInput>,
) => {
  const { dueDate, ...rest } = fields;
  return updateDoc(taskRef(workspaceId, taskId), {
    ...rest,
    ...(dueDate !== undefined && {
      dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
    }),
    updatedAt: serverTimestamp(),
  });
};

export const moveTask = (
  workspaceId: string,
  taskId: string,
  move: { status: TaskStatus; order: number },
) =>
  updateDoc(taskRef(workspaceId, taskId), {
    status: move.status,
    order: move.order,
    updatedAt: serverTimestamp(),
  });

export const deleteTask = (workspaceId: string, taskId: string) =>
  deleteDoc(taskRef(workspaceId, taskId));
