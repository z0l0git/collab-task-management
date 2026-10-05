import { Calendar } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, Badge } from "@/components/ui";
import type { Workspace } from "@/features/workspaces/types";
import { cn } from "@/lib/utils";

import { formatDueDate, isOverdue } from "./dueDate";
import { PriorityIcon } from "./PriorityIcon";
import { StatusIcon } from "./StatusIcon";
import { PRIORITY_LABELS, STATUS_LABELS, assigneeOf, type Task } from "./types";

const createdFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const Property = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="grid min-h-8 grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-2">
    <dt className="text-caption text-ink-subtle">{label}</dt>
    <dd className="text-body-sm text-ink flex min-w-0 flex-wrap items-center gap-2">
      {children}
    </dd>
  </div>
);

const Empty = ({ children }: { children: ReactNode }) => (
  <span className="text-ink-tertiary">{children}</span>
);

export const TaskProperties = ({
  task,
  workspace,
}: {
  task: Task;
  workspace: Workspace;
}) => {
  const assignee = assigneeOf(workspace.members, task.assigneeId);
  const creator = assigneeOf(workspace.members, task.createdBy);
  const overdue = isOverdue(task);

  return (
    <dl className="space-y-1">
      <Property label="Status">
        <StatusIcon status={task.status} />
        {STATUS_LABELS[task.status]}
      </Property>
      <Property label="Priority">
        <PriorityIcon priority={task.priority} />
        {PRIORITY_LABELS[task.priority]}
      </Property>
      <Property label="Assignee">
        {assignee ? (
          <>
            <Avatar
              name={assignee.displayName}
              photoURL={assignee.photoURL}
              size={20}
            />
            <span className="truncate">{assignee.displayName}</span>
          </>
        ) : (
          <Empty>Unassigned</Empty>
        )}
      </Property>
      <Property label="Due date">
        {task.dueDate ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              overdue && "text-danger font-medium",
            )}
          >
            <Calendar className="size-3.5" aria-hidden="true" />
            {formatDueDate(task.dueDate)}
            {overdue ? <span className="sr-only"> (overdue)</span> : null}
          </span>
        ) : (
          <Empty>No due date</Empty>
        )}
      </Property>
      <Property label="Labels">
        {task.labels.length > 0 ? (
          task.labels.map((label) => <Badge key={label}>{label}</Badge>)
        ) : (
          <Empty>No labels</Empty>
        )}
      </Property>
      <Property label="Created">
        <span className="text-ink-muted truncate">
          {[
            creator?.displayName,
            task.createdAt ? createdFormat.format(task.createdAt.toDate()) : "",
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </Property>
    </dl>
  );
};
