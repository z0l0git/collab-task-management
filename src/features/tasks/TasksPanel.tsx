"use client";

import { Columns3, List, ListTodo, Plus, SearchX } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { PanelBody, PanelHeader } from "@/components/layout/Panel";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { useCurrentWorkspace } from "@/features/workspaces/WorkspaceProvider";
import { useQueryParams } from "@/hooks/useQueryParams";
import { cn } from "@/lib/utils";
import { doneStatusIds, statusById } from "@/lib/utils/statuses";
import {
  activeFilterCount,
  CLEARED_FILTERS,
  filterTasks,
  parseFilters,
  parseSort,
} from "@/lib/utils/taskFilters";

import { LoadMoreTasks } from "./LoadMoreTasks";
import { TaskList } from "./TaskList";
import { TaskToolbar } from "./TaskToolbar";
import { useTask } from "./hooks/useTask";
import { useTasks } from "./hooks/useTasks";

const BoardView = dynamic(
  () => import("@/features/board/BoardView").then((module) => module.BoardView),
  {
    ssr: false,
    loading: () => (
      <div className="text-ink-subtle flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    ),
  },
);

const TaskCreateDialog = dynamic(() =>
  import("./TaskCreateDialog").then((module) => module.TaskCreateDialog),
);

const TaskDetailDialog = dynamic(() =>
  import("./TaskDetailDialog").then((module) => module.TaskDetailDialog),
);

const VIEWS = [
  { value: "board", label: "Board", icon: Columns3 },
  { value: "list", label: "List", icon: List },
] as const;

type View = (typeof VIEWS)[number]["value"];

export const TasksPanel = () => {
  const workspace = useCurrentWorkspace();
  const { tasks, loading, error, hasMore, loadingMore, loadMore } = useTasks(
    workspace.id,
  );
  const { searchParams, setParams } = useQueryParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const sort = parseSort(searchParams);
  const filtering = activeFilterCount(filters) > 0;
  const doneIds = useMemo(
    () => doneStatusIds(workspace.statuses),
    [workspace.statuses],
  );
  const visibleTasks = useMemo(
    () => filterTasks(tasks, filters, { doneIds }),
    [tasks, filters, doneIds],
  );
  const view: View = searchParams.get("view") === "list" ? "list" : "board";
  const setView = (next: View) =>
    setParams({ view: next === "board" ? null : next });
  const router = useRouter();
  const openerRef = useRef<HTMLElement | null>(null);
  const openedHereRef = useRef(false);

  const taskId = searchParams.get("task");
  const creating = taskId === "new";
  const columnParam = searchParams.get("column");
  const initialStatus =
    columnParam && statusById(workspace.statuses, columnParam)
      ? columnParam
      : (workspace.statuses[0]?.id ?? "todo");
  const loadedTask =
    taskId && !creating ? tasks.find((task) => task.id === taskId) : undefined;
  const linkedTask = useTask(
    workspace.id,
    taskId && !creating && !loading && !loadedTask ? taskId : null,
  );
  const openTask = loadedTask ?? linkedTask.task;

  const openDialog = useCallback(
    (params: Record<string, string>) => {
      openerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      openedHereRef.current = true;
      setParams(params, "push");
    },
    [setParams],
  );

  const onOpenTask = useCallback(
    (id: string) => openDialog({ task: id }),
    [openDialog],
  );

  const onCreateTask = useCallback(
    (status?: string) =>
      openDialog(status ? { task: "new", column: status } : { task: "new" }),
    [openDialog],
  );

  const clearFilters = () => setParams(CLEARED_FILTERS);

  const onCloseDialog = () => {
    if (openedHereRef.current) router.back();
    else setParams({ task: null, column: null });
  };

  useEffect(() => {
    if (taskId) return;
    openedHereRef.current = false;
    if (openerRef.current?.isConnected) openerRef.current.focus();
    openerRef.current = null;
  }, [taskId]);

  return (
    <>
      <PanelHeader
        parents={[
          { label: workspace.name, href: `/workspaces/${workspace.id}` },
        ]}
        title="Tasks"
        actions={
          <Button
            size="sm"
            leadingIcon={<Plus className="size-3.5" aria-hidden="true" />}
            onClick={() => onCreateTask()}
          >
            New task
          </Button>
        }
      />
      <PanelBody className="py-4 lg:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
          {tasks.length > 0 ? (
            <p className="text-caption text-ink-subtle tabular-nums">
              {filtering ? `${visibleTasks.length} of ` : ""}
              {tasks.length}
              {hasMore ? "+" : ""} {tasks.length === 1 ? "task" : "tasks"}
            </p>
          ) : null}
        </div>

        {tasks.length > 0 || filtering ? (
          <div className="mt-3">
            <TaskToolbar
              workspace={workspace}
              filters={filters}
              sort={sort}
              showSort={view === "list"}
              onChange={setParams}
            />
          </div>
        ) : null}

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
          ) : tasks.length === 0 && !filtering ? (
            <EmptyState
              icon={ListTodo}
              title="No tasks yet"
              description="Create the first task for this workspace."
              action={<Button onClick={() => onCreateTask()}>New task</Button>}
            />
          ) : visibleTasks.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching tasks"
              description={
                hasMore
                  ? `None of the ${tasks.length} newest tasks match. Load more to search older ones, or clear the filters.`
                  : "No task matches these filters. Try removing one."
              }
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : view === "board" ? (
            <BoardView
              workspace={workspace}
              tasks={visibleTasks}
              onOpen={onOpenTask}
              onCreate={onCreateTask}
            />
          ) : (
            <TaskList
              tasks={visibleTasks}
              members={workspace.members}
              statuses={workspace.statuses}
              sort={sort}
              onOpen={onOpenTask}
            />
          )}
          {!loading && !error && hasMore ? (
            <LoadMoreTasks
              loaded={tasks.length}
              loading={loadingMore}
              auto={view === "list" && !filtering}
              onLoadMore={loadMore}
            />
          ) : null}
        </div>

        {creating ? (
          <TaskCreateDialog
            key={initialStatus}
            workspace={workspace}
            initialStatus={initialStatus}
            onClose={onCloseDialog}
          />
        ) : taskId && !loading && !linkedTask.loading ? (
          <TaskDetailDialog
            key={taskId}
            workspace={workspace}
            task={openTask}
            onClose={onCloseDialog}
          />
        ) : null}
      </PanelBody>
    </>
  );
};
