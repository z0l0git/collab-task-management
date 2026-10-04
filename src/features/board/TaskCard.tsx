import { Calendar, User } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui";
import { formatDueDate, isOverdue } from "@/features/tasks/dueDate";
import { PRIORITY_LABELS, type Task } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

export const TaskCard = ({
  task,
  assignee,
  handle,
  onOpen,
  lifted = false,
}: {
  task: Task;
  assignee: string | null;
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
      <span className="text-caption text-ink-subtle flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <Badge variant={`priority-${task.priority}`} withDot>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
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
        {assignee ? (
          <span className="inline-flex min-w-0 items-center gap-1">
            <User className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{assignee}</span>
          </span>
        ) : null}
        {task.labels.map((label) => (
          <Badge key={label}>{label}</Badge>
        ))}
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
