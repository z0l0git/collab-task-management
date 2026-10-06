"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { toUserMessage } from "@/lib/firebase";
import { updateTaskFields } from "@/services/taskService";
import type { TaskInput } from "@/types/task";

export type SaveStatus = "idle" | "saving" | "saved";

export const useTaskAutosave = (workspaceId: string, taskId: string) => {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");
  const pending = useRef(0);

  useEffect(() => {
    if (status !== "saved") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  const save = useCallback(
    async (fields: Partial<TaskInput>) => {
      pending.current += 1;
      setStatus("saving");
      setError("");
      try {
        await updateTaskFields(workspaceId, taskId, fields);
        pending.current -= 1;
        if (pending.current === 0) setStatus("saved");
      } catch (saveError) {
        pending.current -= 1;
        setStatus("idle");
        setError(toUserMessage(saveError, "We couldn't save that change."));
      }
    },
    [workspaceId, taskId],
  );

  return { save, status, error };
};
