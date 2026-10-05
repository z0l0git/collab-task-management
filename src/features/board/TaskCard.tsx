import { Calendar } from "lucide-react";

import { Avatar, Badge } from "@/components/ui";
import { formatDueDate, isOverdue } from "@/features/tasks/dueDate";
import { PriorityIcon } from "@/features/tasks/PriorityIcon";
import type { Assignee, Task } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

const MAX_LABELS = 2;

export const TaskCard = ({
  task,
  assignee,
  onOpen,
  lifted = false,
}: {
  task: Task;
  assignee: Assignee | null;
  onOpen?: () => void;
  lifted?: boolean;
}) => {
  const overdue = isOverdue(task);
  const shownLabels = task.labels.slice(0, MAX_LABELS);
  const hiddenLabels = task.labels.length - shownLabels.length;

  const body = (
    <>
      <span
        className={cn(
          "text-body-sm text-ink line-clamp-2 font-medium wrap-break-word",
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
        <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
          {shownLabels.map((label) => (
            <Badge key={label} className="min-w-0 truncate">
              {label}
            </Badge>
          ))}
          {hiddenLabels > 0 ? (
            <span className="shrink-0">
              +{hiddenLabels}
              <span className="sr-only">
                {" "}
                more {hiddenLabels === 1 ? "label" : "labels"}
              </span>
            </span>
          ) : null}
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

  const cardClasses = cn(
    "border-hairline bg-surface-3 flex w-full flex-col gap-2 rounded-md border p-2.5 text-left transition-colors",
    lifted
      ? "bg-surface-4 border-hairline-strong shadow-modal cursor-grabbing"
      : "hover:border-hairline-strong",
  );

  return onOpen ? (
    <button type="button" onClick={onOpen} className={cardClasses}>
      {body}
    </button>
  ) : (
    <div className={cardClasses}>{body}</div>
  );
};
