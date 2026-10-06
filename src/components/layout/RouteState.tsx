import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const RouteState = ({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-1 flex-col items-center justify-center px-4 py-16 text-center",
      className,
    )}
  >
    <span className="border-hairline bg-surface-1 text-ink-subtle mb-5 flex size-10 items-center justify-center rounded-lg border">
      <Icon className="size-5" aria-hidden="true" />
    </span>
    <h1 className="text-card-title text-ink">{title}</h1>
    <p className="text-body-sm text-ink-subtle mt-2 max-w-sm">{description}</p>
    {children ? (
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {children}
      </div>
    ) : null}
  </div>
);
