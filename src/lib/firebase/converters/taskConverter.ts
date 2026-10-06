import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type WithFieldValue,
} from "firebase/firestore";

import { isTaskPriority, type Task } from "@/types/task";

const asTimestamp = (value: unknown) =>
  value instanceof Timestamp ? value : null;

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];

export const taskConverter: FirestoreDataConverter<Task> = {
  toFirestore: ({ id: _id, ...rest }: WithFieldValue<Task>) => rest,

  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): Task => {
    const data = snapshot.data({ serverTimestamps: "estimate" });
    return {
      id: snapshot.id,
      title: asString(data.title),
      description: asString(data.description),
      status: typeof data.status === "string" ? data.status : "todo",
      priority: isTaskPriority(data.priority) ? data.priority : "medium",
      assigneeId:
        typeof data.assigneeId === "string" && data.assigneeId
          ? data.assigneeId
          : null,
      dueDate: asTimestamp(data.dueDate),
      labels: asStringArray(data.labels),
      order: typeof data.order === "number" ? data.order : 0,
      createdBy: asString(data.createdBy),
      createdAt: asTimestamp(data.createdAt),
      updatedAt: asTimestamp(data.updatedAt),
    };
  },
};
