"use client";

import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { taskConverter } from "@/lib/firebase/converters/taskConverter";
import { taskRef } from "@/services/taskService";
import type { Task } from "@/types/task";

type TaskState = { taskId: string; task: Task | undefined };

export const useTask = (workspaceId: string, taskId: string | null) => {
  const [state, setState] = useState<TaskState | null>(null);

  useEffect(() => {
    if (!taskId) return;
    return onSnapshot(
      taskRef(workspaceId, taskId).withConverter(taskConverter),
      (snapshot) => setState({ taskId, task: snapshot.data() }),
      () => setState({ taskId, task: undefined }),
    );
  }, [workspaceId, taskId]);

  const current = state && state.taskId === taskId ? state : null;

  return {
    task: current?.task,
    loading: taskId !== null && current === null,
  };
};
