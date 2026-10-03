"use client";

import { onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { toUserMessage } from "@/lib/firebase";

import { taskConverter } from "./taskConverter";
import { tasksRef } from "./taskService";
import type { Task } from "./types";

type TasksState = {
  tasks: Task[];
  loading: boolean;
  error: string;
};

export const useTasks = (workspaceId: string) => {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<TasksState>({
    tasks: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    if (authLoading || !user) return;

    return onSnapshot(
      query(
        tasksRef(workspaceId).withConverter(taskConverter),
        orderBy("createdAt", "desc"),
      ),
      (snapshot) =>
        setState({
          tasks: snapshot.docs.map((entry) => entry.data()),
          loading: false,
          error: "",
        }),
      (error) =>
        setState({
          tasks: [],
          loading: false,
          error: toUserMessage(error, "We couldn't load the tasks."),
        }),
    );
  }, [workspaceId, user, authLoading]);

  return state;
};
