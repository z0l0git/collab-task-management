"use client";

import { useDndContext, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Badge } from "@/components/ui";
import {
  assigneeName,
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
}: {
  status: TaskStatus;
  tasks: Task[];
  members: Workspace["members"];
  onOpen: (taskId: string) => void;
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
        "border-hairline bg-surface-1 flex flex-col rounded-lg border transition-colors",
        highlighted && "border-accent/60",
      )}
    >
      <header className="flex items-center gap-2 px-3 pt-3 pb-2">
        <h3 id={headingId}>
          <Badge variant={`status-${status}`} withDot>
            {STATUS_LABELS[status]}
          </Badge>
        </h3>
        <span className="text-caption text-ink-subtle">{tasks.length}</span>
      </header>
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
          {tasks.map((task) => (
            <BoardCard
              key={task.id}
              task={task}
              assignee={assigneeName(members, task.assigneeId)}
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
