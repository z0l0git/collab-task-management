import { cn } from "@/lib/utils";

import { STATUS_LABELS, type TaskStatus } from "./types";

const COLORS: Record<TaskStatus, string> = {
  todo: "text-status-todo",
  in_progress: "text-status-progress",
  done: "text-status-done",
};

export const StatusIcon = ({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) => (
  <svg
    viewBox="0 0 14 14"
    role="img"
    aria-label={STATUS_LABELS[status]}
    className={cn("size-3.5 shrink-0", COLORS[status], className)}
  >
    <title>{STATUS_LABELS[status]}</title>
    {status === "done" ? (
      <>
        <circle cx="7" cy="7" r="6.25" fill="currentColor" />
        <path
          d="M4.5 7.2 6.2 8.9 9.6 5.4"
          fill="none"
          stroke="var(--canvas)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <>
        <circle
          cx="7"
          cy="7"
          r="5.75"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {status === "in_progress" ? (
          <path d="M7 3.5a3.5 3.5 0 0 1 0 7Z" fill="currentColor" />
        ) : null}
      </>
    )}
  </svg>
);
