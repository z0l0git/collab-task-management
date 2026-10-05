"use client";

import { useDndContext, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { StatusIcon } from "@/features/tasks/StatusIcon";
import {
  assigneeOf,
  STATUS_LABELS,
  type Task,
  type TaskStatus,
} from "@/features/tasks/types";
import type { Workspace } from "@/features/workspaces/types";
import { cn } from "@/lib/utils";

import { BoardCard } from "./BoardCard";

const columnId = (status: TaskStatus) => `column-${status}`;

export const BoardColumn = ({
  status,
  tasks,
  members,
  onOpen,
  onCreate,
}: {
  status: TaskStatus;
  tasks: Task[];
  members: Workspace["members"];
  onOpen: (taskId: string) => void;
  onCreate: (status: TaskStatus) => void;
}) => {
  const { setNodeRef } = useDroppable({
    id: columnId(status),
    data: { type: "column", status },
    disabled: tasks.length > 0,
  });
  const { active, over } = useDndContext();
  const highlighted =
    over?.data.current?.status === status &&
    active?.data.current?.status !== status;
  const headingId = `${columnId(status)}-heading`;

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={headingId}
      className={cn(
        "bg-column flex w-[85%] max-w-80 shrink-0 snap-start flex-col rounded-lg ring-1 ring-transparent transition-shadow md:w-auto md:max-w-none",
        highlighted && "ring-accent/60",
      )}
    >
      <header className="flex h-10 items-center gap-2 pr-1.5 pl-3">
        <StatusIcon status={status} />
        <h3 id={headingId} className="text-eyebrow text-ink font-medium">
          {STATUS_LABELS[status]}
        </h3>
        <span className="text-caption text-ink-subtle">{tasks.length}</span>
        <button
          type="button"
          onClick={() => onCreate(status)}
          aria-label={`New ${STATUS_LABELS[status]} task`}
          className="text-ink-subtle hover:bg-surface-3 hover:text-ink ml-auto rounded-md p-1 transition-colors"
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </button>
      </header>
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex min-h-24 flex-1 flex-col gap-1.5 px-1.5 pb-1.5">
          {tasks.map((task) => (
            <BoardCard
              key={task.id}
              task={task}
              assignee={assigneeOf(members, task.assigneeId)}
              onOpen={onOpen}
            />
          ))}
          {tasks.length === 0 ? (
            <li className="border-hairline text-caption text-ink-subtle flex flex-1 items-center justify-center rounded-md border border-dashed px-3 py-6">
              No tasks
            </li>
          ) : null}
        </ul>
      </SortableContext>
    </section>
  );
};
