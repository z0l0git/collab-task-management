"use client";

import { useMemo } from "react";

import { columnTasks } from "@/features/board/ordering";
import type { Workspace } from "@/features/workspaces/types";

import { StatusIcon } from "./StatusIcon";
import { TaskListItem } from "./TaskListItem";
import { assigneeOf, STATUS_LABELS, TASK_STATUSES, type Task } from "./types";

export const TaskList = ({
  tasks,
  members,
  onOpen,
}: {
  tasks: Task[];
  members: Workspace["members"];
  onOpen: (taskId: string) => void;
}) => {
  const groups = useMemo(
    () =>
      TASK_STATUSES.map(
        (status) => [status, columnTasks(tasks, status)] as const,
      ).filter(([, items]) => items.length > 0),
    [tasks],
  );

  return (
    <div className="border-hairline overflow-clip rounded-lg border">
      {groups.map(([status, items]) => (
        <section
          key={status}
          aria-labelledby={`list-group-${status}`}
          className="[&:last-child>ul]:border-b-0"
        >
          <h3
            id={`list-group-${status}`}
            className="bg-column border-hairline text-eyebrow text-ink sticky top-11 z-10 flex h-9 items-center gap-2 border-b px-4 font-medium"
          >
            <StatusIcon status={status} />
            {STATUS_LABELS[status]}
            <span className="text-caption text-ink-subtle font-normal">
              {items.length}
            </span>
          </h3>
          <ul className="divide-hairline border-hairline divide-y border-b">
            {items.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
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
