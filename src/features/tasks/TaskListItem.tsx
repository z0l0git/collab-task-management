"use client";

import { Calendar, User } from "lucide-react";
import { memo } from "react";

import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

import { formatDueDate, isOverdue } from "./dueDate";
import { PRIORITY_LABELS, STATUS_LABELS, type Task } from "./types";

export const TaskListItem = memo(
  ({
    task,
    assigneeName,
    onOpen,
  }: {
    task: Task;
    assigneeName: string | null;
    onOpen: (taskId: string) => void;
  }) => {
    const overdue = isOverdue(task);

    return (
      <li>
        <button
          type="button"
          onClick={() => onOpen(task.id)}
          className="hover:bg-surface-2 flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "text-ink font-medium",
                task.status === "done" && "text-ink-subtle line-through",
              )}
            >
              {task.title}
            </span>
            <Badge variant={`status-${task.status}`} className="shrink-0">
              {STATUS_LABELS[task.status]}
            </Badge>
          </div>
          <div className="text-caption text-ink-subtle flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Badge variant={`priority-${task.priority}`} withDot>
              {PRIORITY_LABELS[task.priority]}
            </Badge>
            <span className="inline-flex items-center gap-1">
              <User className="size-3.5" aria-hidden="true" />
              {assigneeName ?? "Unassigned"}
            </span>
            {task.dueDate ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  overdue && "text-danger font-medium",
                )}
              >
                <Calendar className="size-3.5" aria-hidden="true" />
                {overdue ? "Overdue · " : null}
                {formatDueDate(task.dueDate)}
              </span>
            ) : null}
            {task.labels.map((label) => (
              <Badge key={label}>{label}</Badge>
            ))}
          </div>
        </button>
      </li>
    );
  },
);

TaskListItem.displayName = "TaskListItem";
