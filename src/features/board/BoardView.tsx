"use client";

import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { useMemo } from "react";

import { assigneeName, TASK_STATUSES, type Task } from "@/features/tasks/types";
import type { Workspace } from "@/features/workspaces/types";

import { BoardColumn } from "./BoardColumn";
import { columnTasks } from "./ordering";
import { TaskCard } from "./TaskCard";
import { useBoardDrag } from "./useBoardDrag";

export const BoardView = ({
  workspace,
  tasks,
  onOpen,
}: {
  workspace: Workspace;
  tasks: Task[];
  onOpen: (taskId: string) => void;
}) => {
  const { sensors, activeTask, error, onDragStart, onDragEnd, onDragCancel } =
    useBoardDrag(workspace.id, tasks);

  const columns = useMemo(
    () =>
      TASK_STATUSES.map(
        (status) => [status, columnTasks(tasks, status)] as const,
      ),
    [tasks],
  );

  return (
    <>
      {error ? (
        <p
          role="alert"
          className="bg-danger/10 text-danger text-body-sm mb-3 rounded-md px-3 py-2"
        >
          {error}
        </p>
      ) : null}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="grid gap-3 md:grid-cols-3">
          {columns.map(([status, items]) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={items}
              members={workspace.members}
              onOpen={onOpen}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              assignee={assigneeName(workspace.members, activeTask.assigneeId)}
              lifted
              handle={
                <GripVertical
                  className="text-ink m-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
              }
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};
