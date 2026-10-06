import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, type TaskPriority } from "@/types/task";

const FILLED_BARS: Record<Exclude<TaskPriority, "urgent">, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const COLORS: Record<TaskPriority, string> = {
  low: "text-priority-low",
  medium: "text-priority-medium",
  high: "text-priority-high",
  urgent: "text-priority-urgent",
};

export const PriorityIcon = ({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) => {
  const label = `${PRIORITY_LABELS[priority]} priority`;

  return (
    <svg
      viewBox="0 0 14 14"
      role="img"
      aria-label={label}
      className={cn("size-3.5 shrink-0", COLORS[priority], className)}
    >
      <title>{label}</title>
      {priority === "urgent" ? (
        <>
          <rect x="1" y="1" width="12" height="12" rx="3" fill="currentColor" />
          <path
            d="M7 3.75v4M7 10.1v.15"
            stroke="var(--canvas)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      ) : (
        [0, 1, 2].map((bar) => (
          <rect
            key={bar}
            x={1.5 + bar * 4}
            y={8 - bar * 3}
            width="3"
            height={4.5 + bar * 3}
            rx="1"
            fill="currentColor"
            opacity={bar < FILLED_BARS[priority] ? 1 : 0.3}
          />
        ))
      )}
    </svg>
  );
};
