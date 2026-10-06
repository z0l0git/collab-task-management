"use client";

import { limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { toUserMessage } from "@/lib/firebase";

import { taskConverter } from "./taskConverter";
import { tasksRef } from "./taskService";
import { TASKS_PAGE_SIZE, type Task } from "./types";

type TasksState = {
  key: string;
  tasks: Task[];
  hasMore: boolean;
  error: string;
};

export const useTasks = (workspaceId: string) => {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState({ workspaceId, size: TASKS_PAGE_SIZE });
  const [state, setState] = useState<TasksState | null>(null);

  if (page.workspaceId !== workspaceId) {
    setPage({ workspaceId, size: TASKS_PAGE_SIZE });
  }

  const { size } = page;
  const key = `${workspaceId}:${size}`;

  useEffect(() => {
    if (authLoading || !user) return;

    return onSnapshot(
      query(
        tasksRef(workspaceId).withConverter(taskConverter),
        orderBy("createdAt", "desc"),
        limit(size),
      ),
      (snapshot) =>
        setState({
          key: `${workspaceId}:${size}`,
          tasks: snapshot.docs.map((entry) => entry.data()),
          hasMore: snapshot.size === size,
          error: "",
        }),
      (error) =>
        setState({
          key: `${workspaceId}:${size}`,
          tasks: [],
          hasMore: false,
          error: toUserMessage(error, "We couldn't load the tasks."),
        }),
    );
  }, [workspaceId, size, user, authLoading]);

  const current =
    state && state.key.startsWith(`${workspaceId}:`) ? state : null;

  return {
    tasks: current?.tasks ?? [],
    hasMore: current?.hasMore ?? false,
    error: current?.error ?? "",
    loading: current === null,
    loadingMore: current !== null && current.key !== key,
    loadMore: () =>
      setPage((previous) => ({
        ...previous,
        size: previous.size + TASKS_PAGE_SIZE,
      })),
  };
};
