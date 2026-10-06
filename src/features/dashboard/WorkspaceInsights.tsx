import { AlarmClock, CircleDot, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { taskStats } from "./taskStats";
import type { WorkspaceTasks } from "./useAllWorkspaceTasks";

const Stat = ({
  icon: Icon,
  value,
  label,
  className,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  className?: string;
}) => (
  <span
    className={cn("inline-flex items-center gap-1 tabular-nums", className)}
  >
    <Icon className="size-3.5" aria-hidden="true" />
    {value} {label}
  </span>
);

export const WorkspaceInsights = ({
  state,
  uid,
  doneIds,
  compact = false,
}: {
  state: WorkspaceTasks;
  uid: string | undefined;
  doneIds: Set<string>;
  compact?: boolean;
}) => {
  if (state.status === "loading") {
    return (
      <span
        aria-hidden="true"
        className="bg-surface-3 inline-block h-3 w-40 animate-pulse rounded-full motion-reduce:animate-none"
      />
    );
  }

  if (state.status === "error") {
    return <span className="text-ink-subtle">Stats unavailable</span>;
  }

  const stats = taskStats(state.tasks, uid, doneIds);
  if (stats.total === 0) {
    return <span className="text-ink-subtle">No tasks yet</span>;
  }

  const { open, mine } = stats;
  const done = Math.round((stats.done / stats.total) * 100);

  if (compact) {
    return (
      <span className="text-ink-subtle">
        {open} open
        {stats.overdue > 0 ? (
          <span className="text-danger"> · {stats.overdue} overdue</span>
        ) : null}
        {" · "}
        {done}% done
      </span>
    );
  }

  return (
    <span className="text-ink-subtle flex items-center gap-4">
      <Stat icon={CircleDot} value={open} label="open" />
      {stats.overdue > 0 ? (
        <Stat
          icon={AlarmClock}
          value={stats.overdue}
          label="overdue"
          className="text-danger"
        />
      ) : null}
      {mine > 0 ? <Stat icon={UserRound} value={mine} label="mine" /> : null}
      <span className="inline-flex items-center gap-2 tabular-nums">
        <span
          aria-hidden="true"
          className="bg-surface-4 h-1.5 w-16 overflow-hidden rounded-full"
        >
          <span
            className="bg-status-green block h-full rounded-full"
            style={{ width: `${done}%` }}
          />
        </span>
        {done}% done
      </span>
    </span>
  );
};
