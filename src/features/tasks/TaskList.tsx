"use client";

import { ListTodo, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button, EmptyState, Spinner } from "@/components/ui";
import type { Workspace } from "@/features/workspaces/types";

import { TaskListItem } from "./TaskListItem";
import { useTasks } from "./useTasks";

const TaskFormDialog = dynamic(() =>
  import("./TaskFormDialog").then((module) => module.TaskFormDialog),
);

export const TaskList = ({ workspace }: { workspace: Workspace }) => {
  const { tasks, loading, error } = useTasks(workspace.id);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingTask =
    editingId && editingId !== "new"
      ? tasks.find((task) => task.id === editingId)
      : undefined;

  const assigneeName = (uid: string | null) =>
    uid ? (workspace.members[uid]?.displayName ?? "Former member") : null;

  return (
    <section aria-labelledby="tasks-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="tasks-heading" className="text-card-title text-ink">
          Tasks
          {tasks.length > 0 ? (
            <span className="text-ink-subtle font-normal">
              {" "}
              · {tasks.length}
            </span>
          ) : null}
        </h2>
        <Button
          leadingIcon={<Plus className="size-4" aria-hidden="true" />}
          onClick={() => setEditingId("new")}
        >
          New task
        </Button>
      </div>

      {loading ? (
        <div className="text-ink-subtle flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p
          role="alert"
          className="bg-danger/10 text-danger text-body-sm mt-4 rounded-md px-3 py-2"
        >
          {error}
        </p>
      ) : tasks.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={ListTodo}
          title="No tasks yet"
          description="Create the first task for this workspace."
          action={<Button onClick={() => setEditingId("new")}>New task</Button>}
        />
      ) : (
        <ul className="border-hairline bg-surface-1 divide-hairline mt-4 divide-y overflow-hidden rounded-lg border">
          {tasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              assigneeName={assigneeName(task.assigneeId)}
              onOpen={setEditingId}
            />
          ))}
        </ul>
      )}

      {editingId === "new" || editingTask ? (
        <TaskFormDialog
          key={editingId}
          workspace={workspace}
          task={editingTask}
          onClose={() => setEditingId(null)}
        />
      ) : null}
    </section>
  );
};
