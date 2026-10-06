"use client";

import { useDndContext, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { StatusIcon } from "@/features/tasks/StatusIcon";
import { cn } from "@/lib/utils";
import { statusById, type TaskStatus } from "@/lib/utils/statuses";
import { assigneeOf, type Task } from "@/types/task";
import type { Workspace } from "@/types/workspace";

import { BoardCard } from "./BoardCard";

export const BoardColumn = ({
  columnKey,
  status,
  tasks,
  members,
  statuses,
  onOpen,
  onCreate,
}: {
  columnKey: string;
  status: TaskStatus | undefined;
  tasks: Task[];
  members: Workspace["members"];
  statuses: TaskStatus[];
  onOpen: (taskId: string) => void;
  onCreate: (status: string) => void;
}) => {
  const { setNodeRef } = useDroppable({
    id: `column-${columnKey}`,
    data: { type: "column", status: status?.id },
    disabled: !status || tasks.length > 0,
  });
  const { active, over } = useDndContext();
  const highlighted =
    status !== undefined &&
    over?.data.current?.status === status.id &&
    active?.data.current?.status !== status.id;
  const headingId = `column-${columnKey}-heading`;
  const name = status?.name ?? "No status";

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
        <h3
          id={headingId}
          className="text-eyebrow text-ink truncate font-medium"
        >
          {name}
        </h3>
        <span className="text-caption text-ink-subtle">{tasks.length}</span>
        {status ? (
          <button
            type="button"
            onClick={() => onCreate(status.id)}
            aria-label={`New ${name} task`}
            className="text-ink-subtle hover:bg-hover hover:text-ink ml-auto rounded-md p-1 transition-colors"
          >
            <Plus className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
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
              status={statusById(statuses, task.status)}
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
