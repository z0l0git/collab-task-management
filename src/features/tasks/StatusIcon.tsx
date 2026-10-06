import { cn } from "@/lib/utils";

import { STATUS_TEXT, type TaskStatus } from "./statuses";

export const StatusIcon = ({
  status,
  className,
}: {
  status: TaskStatus | undefined;
  className?: string;
}) => {
  const label = status?.name ?? "No status";

  return (
    <svg
      viewBox="0 0 14 14"
      role="img"
      aria-label={label}
      className={cn(
        "size-3.5 shrink-0",
        status ? STATUS_TEXT[status.color] : "text-ink-tertiary",
        className,
      )}
    >
      <title>{label}</title>
      {status?.done ? (
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
        <circle
          cx="7"
          cy="7"
          r="5.75"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray={status ? undefined : "2 2"}
        />
      )}
    </svg>
  );
};
