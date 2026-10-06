"use client";

import { useMemo } from "react";

import type { Workspace } from "@/features/workspaces/types";

import { statusById, type TaskStatus } from "./statuses";
import { StatusIcon } from "./StatusIcon";
import { sortTasks, type TaskSort } from "./taskFilters";
import { TaskListItem } from "./TaskListItem";
import { assigneeOf, type Task } from "./types";

export const TaskList = ({
  tasks,
  members,
  statuses,
  sort,
  onOpen,
}: {
  tasks: Task[];
  members: Workspace["members"];
  statuses: TaskStatus[];
  sort: TaskSort;
  onOpen: (taskId: string) => void;
}) => {
  const groups = useMemo(() => {
    const known = new Set(statuses.map((status) => status.id));
    return [
      ...statuses.map((status) => ({
        key: status.id,
        status: status as TaskStatus | undefined,
        items: sortTasks(
          tasks.filter((task) => task.status === status.id),
          sort,
        ),
      })),
      {
        key: "no-status",
        status: undefined,
        items: sortTasks(
          tasks.filter((task) => !known.has(task.status)),
          sort,
        ),
      },
    ].filter((group) => group.items.length > 0);
  }, [tasks, statuses, sort]);

  return (
    <div className="border-hairline overflow-clip rounded-lg border">
      {groups.map(({ key, status, items }) => (
        <section
          key={key}
          aria-labelledby={`list-group-${key}`}
          className="[&:last-child>ul]:border-b-0"
        >
          <h3
            id={`list-group-${key}`}
            className="bg-column border-hairline text-eyebrow text-ink sticky top-11 z-10 flex h-9 items-center gap-2 border-b px-4 font-medium"
          >
            <StatusIcon status={status} />
            {status?.name ?? "No status"}
            <span className="text-caption text-ink-subtle font-normal">
              {items.length}
            </span>
          </h3>
          <ul className="divide-hairline border-hairline divide-y border-b">
            {items.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                status={statusById(statuses, task.status)}
                assignee={assigneeOf(members, task.assigneeId)}
                onOpen={onOpen}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};
