"use client";

import { Calendar } from "lucide-react";
import { memo } from "react";

import { Avatar, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

import { formatDueDate, isOverdue } from "./dueDate";
import { PriorityIcon } from "./PriorityIcon";
import { StatusIcon } from "./StatusIcon";
import type { Assignee, Task } from "./types";

export const TaskListItem = memo(
  ({
    task,
    assignee,
    onOpen,
  }: {
    task: Task;
    assignee: Assignee | null;
    onOpen: (taskId: string) => void;
  }) => {
    const overdue = isOverdue(task);

    return (
      <li>
        <button
          type="button"
          onClick={() => onOpen(task.id)}
          className="hover:bg-surface-3 flex h-10 w-full items-center gap-3 px-4 text-left transition-colors"
        >
          <PriorityIcon priority={task.priority} />
          <StatusIcon status={task.status} />
          <span
            className={cn(
              "text-body-sm text-ink min-w-0 flex-1 truncate font-medium",
              task.status === "done" && "text-ink-subtle line-through",
            )}
          >
            {task.title}
          </span>
          <span className="hidden shrink-0 gap-1 sm:flex">
            {task.labels.map((label) => (
              <Badge key={label}>{label}</Badge>
            ))}
          </span>
          {task.dueDate ? (
            <span
              className={cn(
                "text-caption text-ink-subtle inline-flex shrink-0 items-center gap-1",
                overdue && "text-danger font-medium",
              )}
            >
              <Calendar className="size-3.5" aria-hidden="true" />
              {formatDueDate(task.dueDate)}
              {overdue ? <span className="sr-only"> (overdue)</span> : null}
            </span>
          ) : null}
          {assignee ? (
            <>
              <Avatar
                name={assignee.displayName}
                photoURL={assignee.photoURL}
                size={20}
              />
              <span className="sr-only">
                Assigned to {assignee.displayName}
              </span>
            </>
          ) : (
            <span className="sr-only">Unassigned</span>
          )}
        </button>
      </li>
    );
  },
);

TaskListItem.displayName = "TaskListItem";
