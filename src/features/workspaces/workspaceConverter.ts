import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type WithFieldValue,
} from "firebase/firestore";

import {
  DEFAULT_STATUSES,
  isStatusColor,
  type TaskStatus,
} from "@/features/tasks/statuses";

import type { Workspace, WorkspaceMember } from "./types";

const asTimestamp = (value: unknown) =>
  value instanceof Timestamp ? value : null;

const asMembers = (value: unknown): Record<string, WorkspaceMember> =>
  value && typeof value === "object"
    ? (value as Record<string, WorkspaceMember>)
    : {};

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];

const asStatuses = (value: unknown): TaskStatus[] => {
  if (!value || typeof value !== "object") return DEFAULT_STATUSES;
  const statuses = Object.entries(value as Record<string, unknown>)
    .flatMap(([id, entry]) => {
      if (!entry || typeof entry !== "object") return [];
      const { name, color, done, order } = entry as Record<string, unknown>;
      if (typeof name !== "string") return [];
      return [
        {
          id,
          name,
          color: isStatusColor(color) ? color : "gray",
          done: done === true,
          order: typeof order === "number" ? order : 0,
        },
      ];
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .map(({ order: _order, ...status }) => status);
  return statuses.length > 0 ? statuses : DEFAULT_STATUSES;
};

export const statusesToFirestore = (statuses: TaskStatus[]) =>
  Object.fromEntries(
    statuses.map(({ id, ...status }, order) => [id, { ...status, order }]),
  );

export const workspaceConverter: FirestoreDataConverter<Workspace> = {
  toFirestore: ({
    id: _id,
    statuses: _statuses,
    ...rest
  }: WithFieldValue<Workspace>) => rest,

  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): Workspace => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: typeof data.name === "string" ? data.name : "",
      description: typeof data.description === "string" ? data.description : "",
      ownerId: typeof data.ownerId === "string" ? data.ownerId : "",
      memberIds: asStringArray(data.memberIds),
      members: asMembers(data.members),
      labels: asStringArray(data.labels),
      statuses: asStatuses(data.statuses),
      createdAt: asTimestamp(data.createdAt),
      updatedAt: asTimestamp(data.updatedAt),
    };
  },
};
