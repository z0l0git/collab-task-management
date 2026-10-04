"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { memo } from "react";

import type { Assignee, Task } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

import { TaskCard } from "./TaskCard";

export const BoardCard = memo(
  ({
    task,
    assignee,
    onOpen,
  }: {
    task: Task;
    assignee: Assignee | null;
    onOpen: (taskId: string) => void;
  }) => {
    const {
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: task.id,
      data: { type: "task", status: task.status },
    });

    return (
      <li
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        className={cn(isDragging && "opacity-40")}
      >
        <TaskCard
          task={task}
          assignee={assignee}
          onOpen={() => onOpen(task.id)}
          handle={
            <span
              ref={setActivatorNodeRef}
              {...listeners}
              aria-hidden="true"
              className="text-ink-tertiary hover:text-ink hover:bg-surface-4 -my-0.5 shrink-0 cursor-grab touch-none rounded-sm p-0.5 active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </span>
          }
        />
      </li>
    );
  },
);

BoardCard.displayName = "BoardCard";
