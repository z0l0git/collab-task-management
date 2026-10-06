"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { doneStatusIds } from "@/features/tasks/statuses";
import type { Workspace } from "@/features/workspaces/types";
import { toUserMessage } from "@/lib/firebase";

import { fetchTaskCounts, type TaskCounts } from "./taskCountService";

export type TaskCountsState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; counts: TaskCounts };

export const useTaskCounts = (
  workspace: Pick<Workspace, "id" | "statuses">,
  { breakdown = false }: { breakdown?: boolean } = {},
): TaskCountsState => {
  const { user } = useAuth();
  const uid = user?.uid ?? "";
  const doneIds = [...doneStatusIds(workspace.statuses)].join(",");
  const statusIds = breakdown
    ? workspace.statuses.map((status) => status.id).join(",")
    : "";
  const key = [workspace.id, uid, doneIds, statusIds].join("|");
  const [state, setState] = useState<{
    key: string;
    value: TaskCountsState;
  } | null>(null);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    const load = () =>
      fetchTaskCounts(workspace.id, {
        uid,
        doneIds: doneIds ? doneIds.split(",") : [],
        statusIds: statusIds ? statusIds.split(",") : [],
      }).then(
        (counts) => {
          if (active) setState({ key, value: { status: "ready", counts } });
        },
        (error: unknown) => {
          if (active)
            setState({
              key,
              value: {
                status: "error",
                error: toUserMessage(error, "We couldn't load the numbers."),
              },
            });
        },
      );
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };

    void load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [key, workspace.id, uid, doneIds, statusIds]);

  return state?.key === key ? state.value : { status: "loading" };
};
