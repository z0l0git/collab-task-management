"use client";

import { Columns3, List, ListTodo, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button, EmptyState, Spinner } from "@/components/ui";
import { BoardView } from "@/features/board/BoardView";
import type { Workspace } from "@/features/workspaces/types";
import { cn } from "@/lib/utils";

import { TaskList } from "./TaskList";
import { useTasks } from "./useTasks";

const TaskFormDialog = dynamic(() =>
  import("./TaskFormDialog").then((module) => module.TaskFormDialog),
);

const VIEWS = [
  { value: "board", label: "Board", icon: Columns3 },
  { value: "list", label: "List", icon: List },
] as const;

type View = (typeof VIEWS)[number]["value"];

export const TasksPanel = ({ workspace }: { workspace: Workspace }) => {
  const { tasks, loading, error } = useTasks(workspace.id);
  const [view, setView] = useState<View>("board");
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingTask =
    editingId && editingId !== "new"
      ? tasks.find((task) => task.id === editingId)
      : undefined;

  return (
    <section aria-labelledby="tasks-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="tasks-heading" className="text-card-title text-ink">
          Tasks
          {tasks.length > 0 ? (
            <span className="text-ink-subtle font-normal">
              {" "}
              · {tasks.length}
            </span>
          ) : null}
        </h2>
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Task view"
            className="border-hairline bg-surface-1 flex rounded-md border p-0.5"
          >
            {VIEWS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={view === value}
                onClick={() => setView(value)}
                className={cn(
                  "text-caption inline-flex h-7 items-center gap-1.5 rounded-sm px-2.5 font-medium transition-colors",
                  view === value
                    ? "bg-surface-3 text-ink"
                    : "text-ink-subtle hover:text-ink",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
          <Button
            leadingIcon={<Plus className="size-4" aria-hidden="true" />}
            onClick={() => setEditingId("new")}
          >
            New task
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="text-ink-subtle flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <p
            role="alert"
            className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
          >
            {error}
          </p>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No tasks yet"
            description="Create the first task for this workspace."
            action={
              <Button onClick={() => setEditingId("new")}>New task</Button>
            }
          />
        ) : view === "board" ? (
          <BoardView
            workspace={workspace}
            tasks={tasks}
            onOpen={setEditingId}
          />
        ) : (
          <TaskList
            tasks={tasks}
            members={workspace.members}
            onOpen={setEditingId}
          />
        )}
      </div>

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
