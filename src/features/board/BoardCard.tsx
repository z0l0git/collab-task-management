"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo } from "react";

import type { TaskStatus } from "@/features/tasks/statuses";
import type { Assignee, Task } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

import { TaskCard } from "./TaskCard";

export const BoardCard = memo(
  ({
    task,
    status,
    assignee,
    onOpen,
  }: {
    task: Task;
    status: TaskStatus | undefined;
    assignee: Assignee | null;
    onOpen: (taskId: string) => void;
  }) => {
    const { listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({
        id: task.id,
        data: { type: "task", status: task.status },
      });

    return (
      <li
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        {...listeners}
        className={cn(
          "touch-manipulation select-none [-webkit-touch-callout:none]",
          isDragging && "opacity-40",
        )}
      >
        <TaskCard
          task={task}
          status={status}
          assignee={assignee}
          onOpen={() => onOpen(task.id)}
        />
      </li>
    );
  },
);

BoardCard.displayName = "BoardCard";
