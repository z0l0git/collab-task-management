import { ChevronRight, X } from "lucide-react";
import type { ReactNode } from "react";

export const iconButtonClasses =
  "text-ink-subtle hover:bg-hover hover:text-ink rounded-md p-1.5 transition-colors";

export const TaskDialogHeader = ({
  workspaceName,
  taskTitle,
  titleId,
  onClose,
  children,
}: {
  workspaceName: string;
  taskTitle: string;
  titleId?: string;
  onClose: () => void;
  children?: ReactNode;
}) => (
  <div className="border-hairline flex h-11 shrink-0 items-center gap-1 border-b pr-2 pl-4">
    <nav
      aria-label="Breadcrumb"
      className="text-eyebrow flex min-w-0 flex-1 items-center gap-1.5 font-medium"
    >
      <span className="text-ink-subtle truncate">{workspaceName}</span>
      <ChevronRight
        className="text-ink-tertiary size-3.5 shrink-0"
        aria-hidden="true"
      />
      <span id={titleId} className="text-ink truncate" aria-current="page">
        {taskTitle}
      </span>
    </nav>
    {children}
    <button
      type="button"
      onClick={onClose}
      aria-label="Close task"
      className={iconButtonClasses}
    >
      <X className="size-4" aria-hidden="true" />
    </button>
  </div>
);
