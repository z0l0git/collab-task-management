"use client";

import { Calendar, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "row" | "pill";

const baseClasses =
  "text-ink hover:bg-surface-3 focus-visible:ring-accent-focus min-w-0 cursor-pointer appearance-none truncate outline-none transition-colors focus-visible:ring-2";

const VARIANTS: Record<Variant, { wrapper: string; control: string }> = {
  row: {
    wrapper: "relative inline-flex md:flex md:w-full",
    control:
      "text-caption border-hairline bg-surface-1 field-sizing-content h-7 rounded-full border pr-3 pl-7 font-medium md:text-body-sm md:field-sizing-fixed md:h-8 md:w-full md:rounded-md md:border-0 md:bg-transparent md:pr-2 md:pl-8 md:font-normal",
  },
  pill: {
    wrapper: "relative inline-flex",
    control:
      "text-caption border-hairline bg-surface-1 field-sizing-content h-7 rounded-full border pr-3 pl-7 font-medium",
  },
};

const LeadingIcon = ({
  variant,
  children,
}: {
  variant: Variant;
  children: ReactNode;
}) => (
  <span
    className={cn(
      "pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center",
      variant === "row" ? "left-2.5 md:left-2" : "left-2.5",
    )}
  >
    {children}
  </span>
);

export const PropertyChip = <T extends string>({
  label,
  value,
  options,
  icon,
  onChange,
  variant = "row",
  className,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  icon: ReactNode;
  onChange: (value: T) => void;
  variant?: Variant;
  className?: string;
}) => (
  <div className={VARIANTS[variant].wrapper}>
    <LeadingIcon variant={variant}>{icon}</LeadingIcon>
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className={cn(baseClasses, VARIANTS[variant].control, className)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const isPlausibleDate = (value: string) => Number(value.slice(0, 4)) >= 1900;

export const PropertyDateChip = ({
  label,
  value,
  danger,
  onChange,
  variant = "row",
}: {
  label: string;
  value: string;
  danger?: boolean;
  onChange: (value: string) => void;
  variant?: Variant;
}) => {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);

  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  const commit = (next: string) => {
    setDraft(next);
    if (next === "" || isPlausibleDate(next)) onChange(next);
  };

  return (
    <div className={VARIANTS[variant].wrapper}>
      <LeadingIcon variant={variant}>
        <Calendar
          className={cn("size-3.5", danger ? "text-danger" : "text-ink-subtle")}
          aria-hidden="true"
        />
      </LeadingIcon>
      <input
        type="date"
        aria-label={label}
        value={draft}
        onChange={(event) => commit(event.target.value)}
        onClick={(event) => event.currentTarget.showPicker?.()}
        className={cn(
          baseClasses,
          VARIANTS[variant].control,
          "[&::-webkit-calendar-picker-indicator]:hidden",
          variant === "pill" ? "w-36" : "max-md:w-36",
          draft ? "pr-7 md:pr-7" : "text-ink-subtle",
          danger && "text-danger font-medium",
        )}
      />
      {draft ? (
        <button
          type="button"
          onClick={() => commit("")}
          aria-label="Clear date"
          className="text-ink-subtle hover:text-ink hover:bg-surface-4 absolute top-1/2 right-1 -translate-y-1/2 rounded-sm p-1"
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
};
