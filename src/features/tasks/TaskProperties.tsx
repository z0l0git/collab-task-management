"use client";

import { UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar } from "@/components/ui";
import { memberList, type Workspace } from "@/features/workspaces/types";
import { cn } from "@/lib/utils";

import { fromDateInputValue, isOverdue, toDateInputValue } from "./dueDate";
import { LabelPicker } from "./LabelPicker";
import { PriorityIcon } from "./PriorityIcon";
import { PropertyChip, PropertyDateChip } from "./PropertyChip";
import { StatusIcon } from "./StatusIcon";
import { statusById, statusOptions } from "./statuses";
import {
  PRIORITY_LABELS,
  TASK_PRIORITIES,
  assigneeOf,
  type Task,
  type TaskInput,
} from "./types";

const PRIORITY_OPTIONS = TASK_PRIORITIES.map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));

const createdFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const Property = ({
  label,
  align = "center",
  desktopOnly = false,
  children,
}: {
  label: string;
  align?: "center" | "start";
  desktopOnly?: boolean;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "md:grid md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-1",
      align === "center"
        ? "md:min-h-8 md:items-center"
        : "md:items-start md:py-1.5",
      desktopOnly ? "max-md:hidden" : "max-md:contents",
    )}
  >
    <dt className="text-caption text-ink-subtle max-md:sr-only">{label}</dt>
    <dd className="min-w-0 items-center max-md:contents md:flex">{children}</dd>
  </div>
);

export const TaskProperties = ({
  task,
  workspace,
  onSave,
}: {
  task: Task;
  workspace: Workspace;
  onSave: (fields: Partial<TaskInput>) => void;
}) => {
  const assignee = assigneeOf(workspace.members, task.assigneeId);
  const status = statusById(workspace.statuses, task.status);
  const overdue = isOverdue(task, status?.done ?? false);
  const creator = assigneeOf(workspace.members, task.createdBy);

  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...memberList(workspace).map((member) => ({
      value: member.uid,
      label: member.displayName,
    })),
    ...(task.assigneeId && !workspace.memberIds.includes(task.assigneeId)
      ? [{ value: task.assigneeId, label: "Former member" }]
      : []),
  ];

  return (
    <dl className="flex flex-wrap items-center gap-2 md:block md:space-y-0.5">
      <Property label="Status">
        <PropertyChip
          label="Status"
          value={task.status}
          options={statusOptions(workspace.statuses, task.status)}
          icon={<StatusIcon status={status} />}
          onChange={(status) => onSave({ status })}
        />
      </Property>
      <Property label="Priority">
        <PropertyChip
          label="Priority"
          value={task.priority}
          options={PRIORITY_OPTIONS}
          icon={<PriorityIcon priority={task.priority} />}
          onChange={(priority) => onSave({ priority })}
        />
      </Property>
      <Property label="Assignee">
        <PropertyChip
          label="Assignee"
          value={task.assigneeId ?? ""}
          options={assigneeOptions}
          icon={
            assignee ? (
              <Avatar
                name={assignee.displayName}
                photoURL={assignee.photoURL}
                size={16}
              />
            ) : (
              <UserRound
                className="text-ink-subtle size-3.5"
                aria-hidden="true"
              />
            )
          }
          onChange={(assigneeId) => onSave({ assigneeId: assigneeId || null })}
        />
      </Property>
      <Property label="Due date">
        <PropertyDateChip
          label={overdue ? "Due date (overdue)" : "Due date"}
          value={toDateInputValue(task.dueDate)}
          danger={overdue}
          onChange={(value) => onSave({ dueDate: fromDateInputValue(value) })}
        />
      </Property>
      <Property label="Labels" align="start">
        <div className="md:px-2">
          <LabelPicker
            compact
            options={workspace.labels}
            value={task.labels}
            onChange={(labels) => onSave({ labels })}
          />
        </div>
      </Property>
      <Property label="Created" desktopOnly>
        <span className="text-body-sm text-ink-muted truncate px-2">
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
