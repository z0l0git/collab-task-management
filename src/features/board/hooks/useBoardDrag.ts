"use client";

import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";

import { toUserMessage } from "@/lib/firebase";
import { planMove } from "@/lib/utils/ordering";
import { statusById, type TaskStatus } from "@/lib/utils/statuses";
import { moveTask } from "@/services/taskService";
import type { Task } from "@/types/task";

export const useBoardDrag = (
  workspaceId: string,
  tasks: Task[],
  statuses: TaskStatus[],
) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  );

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    setError("");
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    const status = over?.data.current?.status as string | undefined;
    if (!over || !status || !statusById(statuses, status)) return;

    const dragged = active.rect.current.translated;
    const move = planMove(tasks, String(active.id), {
      status,
      overId: over.data.current?.type === "task" ? String(over.id) : null,
      below:
        dragged !== null && dragged.top > over.rect.top + over.rect.height / 2,
    });
    if (!move) return;

    moveTask(workspaceId, String(active.id), move).catch((caught: unknown) =>
      setError(toUserMessage(caught, "We couldn't move that task.")),
    );
  };

  return {
    sensors,
    activeTask: tasks.find((task) => task.id === activeId),
    error,
    onDragStart,
    onDragEnd,
    onDragCancel: () => setActiveId(null),
  };
};
