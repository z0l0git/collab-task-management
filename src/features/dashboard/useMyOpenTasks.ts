"use client";

import { limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { taskConverter } from "@/features/tasks/taskConverter";
import { tasksRef } from "@/features/tasks/taskService";
import type { Task } from "@/features/tasks/types";
import type { Workspace } from "@/features/workspaces/types";
import { toUserMessage } from "@/lib/firebase";

export const MY_TASKS_LIMIT = 20;

type MyTasksState = { key: string; tasks: Task[]; error: string };

export const useMyOpenTasks = (
  workspace: Pick<Workspace, "id" | "statuses">,
) => {
  const { user } = useAuth();
  const uid = user?.uid ?? "";
  const openIds = workspace.statuses
    .filter((status) => !status.done)
    .map((status) => status.id)
    .join(",");
  const key = [workspace.id, uid, openIds].join("|");
  const [state, setState] = useState<MyTasksState | null>(null);

  useEffect(() => {
    if (!uid || !openIds) return;
    return onSnapshot(
      query(
        tasksRef(workspace.id).withConverter(taskConverter),
        where("assigneeId", "==", uid),
        where("status", "in", openIds.split(",")),
        limit(MY_TASKS_LIMIT),
      ),
      (snapshot) =>
        setState({
          key,
          tasks: snapshot.docs.map((entry) => entry.data()),
          error: "",
        }),
      (error) =>
        setState({
          key,
          tasks: [],
          error: toUserMessage(error, "We couldn't load your tasks."),
        }),
    );
  }, [key, workspace.id, uid, openIds]);

  if (uid && !openIds) return { tasks: [], error: "", loading: false };
  const current = state?.key === key ? state : null;
  return {
    tasks: current?.tasks ?? [],
    error: current?.error ?? "",
    loading: current === null,
  };
};
