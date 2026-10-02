import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type WithFieldValue,
} from "firebase/firestore";

import type { Workspace, WorkspaceMember } from "./types";

const asTimestamp = (value: unknown) =>
  value instanceof Timestamp ? value : null;

const asMembers = (value: unknown): Record<string, WorkspaceMember> =>
  value && typeof value === "object"
    ? (value as Record<string, WorkspaceMember>)
    : {};

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];

export const workspaceConverter: FirestoreDataConverter<Workspace> = {
  toFirestore: ({ id: _id, ...rest }: WithFieldValue<Workspace>) => rest,

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
      createdAt: asTimestamp(data.createdAt),
      updatedAt: asTimestamp(data.updatedAt),
    };
  },
};
