import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const VARIANTS = {
  neutral: "bg-surface-2 text-ink-muted border border-hairline",
  accent: "bg-accent-soft/10 text-accent-soft",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",

  "priority-low": "bg-surface-2 text-ink-subtle border border-hairline",
  "priority-medium": "bg-priority-medium/10 text-priority-medium",
  "priority-high": "bg-priority-high/10 text-priority-high",
  "priority-urgent": "bg-priority-urgent/10 text-priority-urgent",

  "status-todo": "bg-surface-2 text-ink-subtle border border-hairline",
  "status-in_progress": "bg-status-progress/10 text-status-progress",
  "status-done": "bg-status-done/10 text-status-done",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  withDot?: boolean;
};

export const Badge = ({
  variant = "neutral",
  withDot = false,
  className,
  children,
  ...props
}: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
        "text-caption font-medium whitespace-nowrap",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {withDot ? (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
};
