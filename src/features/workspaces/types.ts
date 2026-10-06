import type { Timestamp } from "firebase/firestore";

import type { TaskStatus } from "@/features/tasks/statuses";

export const WORKSPACE_ROLES = ["owner", "member"] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export type WorkspaceMember = {
  role: WorkspaceRole;
  displayName: string;
  email: string;
  photoURL: string | null;
};

export type Workspace = {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  members: Record<string, WorkspaceMember>;
  labels: string[];
  statuses: TaskStatus[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export const isOwner = (workspace: Workspace, uid: string | undefined) =>
  Boolean(uid) && workspace.ownerId === uid;

export const memberList = (workspace: Workspace) =>
  workspace.memberIds
    .map((uid) => ({ uid, ...workspace.members[uid] }))
    .filter((member): member is { uid: string } & WorkspaceMember =>
      Boolean(member.role),
    )
    .sort((a, b) =>
      a.role === b.role
        ? a.displayName.localeCompare(b.displayName)
        : a.role === "owner"
          ? -1
          : 1,
    );
