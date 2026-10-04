"use client";

import type { Workspace } from "@/features/workspaces/types";

import { TaskListItem } from "./TaskListItem";
import { assigneeName, type Task } from "./types";

export const TaskList = ({
  tasks,
  members,
  onOpen,
}: {
  tasks: Task[];
  members: Workspace["members"];
  onOpen: (taskId: string) => void;
}) => (
  <ul className="border-hairline bg-surface-1 divide-hairline divide-y overflow-hidden rounded-lg border">
    {tasks.map((task) => (
      <TaskListItem
        key={task.id}
        task={task}
        assigneeName={assigneeName(members, task.assigneeId)}
        onOpen={onOpen}
      />
    ))}
  </ul>
);
