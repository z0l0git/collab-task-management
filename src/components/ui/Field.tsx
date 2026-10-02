import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

export function fieldIds(id: string) {
  return { hintId: `${id}-hint`, errorId: `${id}-error` };
}

export function Field({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps & { id: string; children: ReactNode }) {
  const { hintId, errorId } = fieldIds(id);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="text-eyebrow text-ink-muted">
          {label}
          {required ? (
            <span className="text-danger" aria-hidden="true">
              {" "}
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {children}

      {error ? (
        <p id={errorId} role="alert" className="text-caption text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-caption text-ink-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const controlClasses = (hasError: boolean) =>
  cn(
    "w-full rounded-md border bg-surface-1 px-3 py-2 text-body-sm text-ink",
    "placeholder:text-ink-subtle transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    hasError ? "border-danger" : "border-hairline hover:border-hairline-strong",
  );
