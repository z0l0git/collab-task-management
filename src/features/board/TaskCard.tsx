import { Calendar } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, Badge } from "@/components/ui";
import { formatDueDate, isOverdue } from "@/features/tasks/dueDate";
import { PriorityIcon } from "@/features/tasks/PriorityIcon";
import type { Assignee, Task } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

export const TaskCard = ({
  task,
  assignee,
  handle,
  onOpen,
  lifted = false,
}: {
  task: Task;
  assignee: Assignee | null;
  handle: ReactNode;
  onOpen?: () => void;
  lifted?: boolean;
}) => {
  const overdue = isOverdue(task);

  const body = (
    <>
      <span
        className={cn(
          "text-body-sm text-ink font-medium wrap-break-word",
          task.status === "done" && "text-ink-subtle line-through",
        )}
      >
        {task.title}
      </span>
      <span className="text-caption text-ink-subtle flex items-center gap-2">
        <PriorityIcon priority={task.priority} />
        {task.dueDate ? (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              overdue && "text-danger font-medium",
            )}
          >
            <Calendar className="size-3.5" aria-hidden="true" />
            {formatDueDate(task.dueDate)}
            {overdue ? <span className="sr-only"> (overdue)</span> : null}
          </span>
        ) : null}
        <span className="flex min-w-0 flex-1 gap-1 overflow-hidden">
          {task.labels.map((label) => (
            <Badge key={label}>{label}</Badge>
          ))}
        </span>
        {assignee ? (
          <>
            <Avatar
              name={assignee.displayName}
              photoURL={assignee.photoURL}
              size={20}
            />
            <span className="sr-only">Assigned to {assignee.displayName}</span>
          </>
        ) : null}
      </span>
    </>
  );

  return (
    <div
      className={cn(
        "border-hairline bg-surface-2 flex items-start gap-1 rounded-md border p-2 transition-colors",
        lifted
          ? "bg-surface-3 border-hairline-strong shadow-modal"
          : "hover:bg-surface-3 hover:border-hairline-strong",
      )}
    >
      {handle}
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 flex-col gap-2 rounded-sm py-0.5 text-left"
        >
          {body}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">{body}</div>
      )}
    </div>
  );
};
