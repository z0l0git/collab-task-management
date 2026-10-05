"use client";

import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { taskConverter } from "@/features/tasks/taskConverter";
import { tasksRef } from "@/features/tasks/taskService";
import type { Task } from "@/features/tasks/types";
import { toUserMessage } from "@/lib/firebase";

export type WorkspaceTasks =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; tasks: Task[] };

export const useAllWorkspaceTasks = (workspaceIds: string[]) => {
  const key = workspaceIds.join(",");
  const [byWorkspace, setByWorkspace] = useState<
    Record<string, WorkspaceTasks>
  >({});

  useEffect(() => {
    const ids = key ? key.split(",") : [];
    const unsubscribes = ids.map((workspaceId) =>
      onSnapshot(
        tasksRef(workspaceId).withConverter(taskConverter),
        (snapshot) =>
          setByWorkspace((current) => ({
            ...current,
            [workspaceId]: {
              status: "ready",
              tasks: snapshot.docs.map((entry) => entry.data()),
            },
          })),
        (error) =>
          setByWorkspace((current) => ({
            ...current,
            [workspaceId]: {
              status: "error",
              error: toUserMessage(error, "We couldn't load tasks."),
            },
          })),
      ),
    );
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [key]);

  return (workspaceId: string): WorkspaceTasks =>
    byWorkspace[workspaceId] ?? { status: "loading" };
};
