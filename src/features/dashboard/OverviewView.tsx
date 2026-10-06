"use client";

import {
  AlarmClock,
  ArrowRight,
  Layers,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, type ReactNode } from "react";

import { PanelBody, PanelHeader } from "@/components/layout/Panel";
import { EmptyState } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { STATUS_BG, statusById } from "@/features/tasks/statuses";
import { StatusIcon } from "@/features/tasks/StatusIcon";
import { sortTasks } from "@/features/tasks/taskFilters";
import { TaskListItem } from "@/features/tasks/TaskListItem";
import { assigneeOf } from "@/features/tasks/types";
import { useCurrentWorkspace } from "@/features/workspaces/WorkspaceProvider";
import { cn } from "@/lib/utils";

import { useMyOpenTasks } from "./useMyOpenTasks";
import { useTaskCounts } from "./useTaskCounts";

const Tile = ({
  href,
  label,
  value,
  icon,
  tone,
}: {
  href: string;
  label: string;
  value: number | null;
  icon: ReactNode;
  tone?: "danger";
}) => (
  <li>
    <Link
      href={href}
      className="border-hairline bg-surface-1 hover:bg-surface-3 hover:border-hairline-strong flex h-full flex-col gap-3 rounded-lg border p-4 transition-colors"
    >
      <span className="text-caption text-ink-subtle flex items-center gap-1.5 font-medium">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      {value === null ? (
        <span
          aria-hidden="true"
          className="bg-surface-3 block h-8 w-12 animate-pulse rounded-md motion-reduce:animate-none"
        />
      ) : (
        <span
          className={cn(
            "text-title tabular-nums",
            tone === "danger" && value > 0 ? "text-danger" : "text-ink",
          )}
        >
          {value}
        </span>
      )}
    </Link>
  </li>
);

const TileIcon = ({ icon: Icon }: { icon: LucideIcon }) => (
  <Icon className="size-3.5" aria-hidden="true" />
);

const Section = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section aria-label={title} className="space-y-3">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-eyebrow text-ink font-medium">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

export const OverviewView = () => {
  const workspace = useCurrentWorkspace();
  const { user } = useAuth();
  const router = useRouter();
  const counts = useTaskCounts(workspace, { breakdown: true });
  const myTasks = useMyOpenTasks(workspace);
  const ready = counts.status === "ready" ? counts.counts : null;
  const tasksHref = `/workspaces/${workspace.id}`;
  const listHref = (params: Record<string, string>) =>
    `${tasksHref}?${new URLSearchParams({ view: "list", ...params })}`;

  const sortedMine = useMemo(
    () => sortTasks(myTasks.tasks, "due"),
    [myTasks.tasks],
  );

  const onOpen = useCallback(
    (taskId: string) => router.push(`${tasksHref}?task=${taskId}`),
    [router, tasksHref],
  );

  return (
    <>
      <PanelHeader
        parents={[{ label: workspace.name, href: tasksHref }]}
        title="Overview"
      />
      <PanelBody>
        <div className="mx-auto w-full max-w-5xl space-y-8">
          {counts.status === "error" ? (
            <p
              role="alert"
              className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
            >
              {counts.error}
            </p>
          ) : null}

          <Section title="Tasks">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]">
              <Tile
                href={tasksHref}
                label="Total"
                value={ready?.total ?? null}
                icon={<TileIcon icon={Layers} />}
              />
              {workspace.statuses.map((status) => (
                <Tile
                  key={status.id}
                  href={listHref({ status: status.id })}
                  label={status.name}
                  value={ready ? (ready.byStatus[status.id] ?? 0) : null}
                  icon={<StatusIcon status={status} />}
                />
              ))}
              <Tile
                href={listHref({ due: "overdue", sort: "due" })}
                label="Overdue"
                value={ready?.overdue ?? null}
                icon={<TileIcon icon={AlarmClock} />}
                tone="danger"
              />
              <Tile
                href={listHref({ assignee: user?.uid ?? "", sort: "due" })}
                label="Assigned to me"
                value={ready?.mine ?? null}
                icon={<TileIcon icon={UserRound} />}
              />
            </ul>
          </Section>

          {ready && ready.total > 0 ? (
            <Section title="By status">
              <div className="border-hairline bg-surface-1 space-y-4 rounded-lg border p-4">
                <div
                  aria-hidden="true"
                  className="bg-surface-4 flex h-2 overflow-hidden rounded-full"
                >
                  {workspace.statuses.map((status) => (
                    <span
                      key={status.id}
                      className={STATUS_BG[status.color]}
                      style={{
                        width: `${((ready.byStatus[status.id] ?? 0) / ready.total) * 100}%`,
                      }}
                    />
                  ))}
                </div>
                <ul className="text-caption grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {workspace.statuses.map((status) => {
                    const value = ready.byStatus[status.id] ?? 0;
                    return (
                      <li key={status.id} className="flex items-center gap-2">
                        <StatusIcon status={status} />
                        <span className="text-ink-muted truncate">
                          {status.name}
                        </span>
                        <span className="text-ink-subtle ml-auto tabular-nums">
                          {value} · {Math.round((value / ready.total) * 100)}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Section>
          ) : null}

          <Section
            title="My open tasks"
            action={
              sortedMine.length > 0 ? (
                <Link
                  href={listHref({ assignee: user?.uid ?? "", sort: "due" })}
                  className="text-caption text-ink-subtle hover:text-ink inline-flex items-center gap-1 font-medium transition-colors"
                >
                  View all
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              ) : null
            }
          >
            {myTasks.error ? (
              <p
                role="alert"
                className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
              >
                {myTasks.error}
              </p>
            ) : myTasks.loading ? (
              <div
                aria-hidden="true"
                className="border-hairline bg-surface-1 h-30 animate-pulse rounded-lg border motion-reduce:animate-none"
              />
            ) : sortedMine.length === 0 ? (
              <EmptyState
                icon={UserRound}
                title="Nothing on your plate"
                description="Open tasks assigned to you show up here."
              />
            ) : (
              <ul className="border-hairline divide-hairline divide-y overflow-hidden rounded-lg border">
                {sortedMine.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    status={statusById(workspace.statuses, task.status)}
                    assignee={assigneeOf(workspace.members, task.assigneeId)}
                    onOpen={onOpen}
                  />
                ))}
              </ul>
            )}
          </Section>

          <p className="text-caption text-ink-subtle">
            Counts cover every task in the workspace and refresh when you open
            this page or come back to the tab.
          </p>
        </div>
      </PanelBody>
    </>
  );
};
