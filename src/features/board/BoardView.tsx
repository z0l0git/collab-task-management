"use client";

import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import { useMemo } from "react";

import { columnTasks } from "@/lib/utils/ordering";
import { statusById } from "@/lib/utils/statuses";
import { assigneeOf, type Task } from "@/types/task";
import type { Workspace } from "@/types/workspace";

import { BoardColumn } from "./BoardColumn";
import { TaskCard } from "./TaskCard";
import { useBoardDrag } from "./hooks/useBoardDrag";

const NO_STATUS_KEY = "no-status";

export const BoardView = ({
  workspace,
  tasks,
  onOpen,
  onCreate,
}: {
  workspace: Workspace;
  tasks: Task[];
  onOpen: (taskId: string) => void;
  onCreate: (status: string) => void;
}) => {
  const { sensors, activeTask, error, onDragStart, onDragEnd, onDragCancel } =
    useBoardDrag(workspace.id, tasks, workspace.statuses);

  const columns = useMemo(() => {
    const known = new Set(workspace.statuses.map((status) => status.id));
    const orphans = tasks
      .filter((task) => !known.has(task.status))
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    return [
      ...workspace.statuses.map((status) => ({
        key: status.id,
        status,
        tasks: columnTasks(tasks, status.id),
      })),
      ...(orphans.length > 0
        ? [{ key: NO_STATUS_KEY, status: undefined, tasks: orphans }]
        : []),
    ];
  }, [tasks, workspace.statuses]);

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
        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:auto-cols-[minmax(16rem,1fr)] md:grid-flow-col md:px-0">
          {columns.map((column) => (
            <BoardColumn
              key={column.key}
              columnKey={column.key}
              status={column.status}
              tasks={column.tasks}
              members={workspace.members}
              statuses={workspace.statuses}
              onOpen={onOpen}
              onCreate={onCreate}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              status={statusById(workspace.statuses, activeTask.status)}
              assignee={assigneeOf(workspace.members, activeTask.assigneeId)}
              lifted
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};
