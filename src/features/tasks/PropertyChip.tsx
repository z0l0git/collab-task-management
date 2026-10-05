"use client";

import { Calendar, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const controlClasses =
  "text-body-sm text-ink hover:bg-surface-3 focus-visible:ring-accent-focus h-8 w-full min-w-0 cursor-pointer appearance-none truncate rounded-md bg-transparent pr-2 pl-8 outline-none transition-colors focus-visible:ring-2";

const LeadingIcon = ({ children }: { children: ReactNode }) => (
  <span className="pointer-events-none absolute top-1/2 left-2 flex -translate-y-1/2 items-center">
    {children}
  </span>
);

export const PropertyChip = <T extends string>({
  label,
  value,
  options,
  icon,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  icon: ReactNode;
  onChange: (value: T) => void;
}) => (
  <div className="relative w-full">
    <LeadingIcon>{icon}</LeadingIcon>
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className={controlClasses}
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
}: {
  label: string;
  value: string;
  danger?: boolean;
  onChange: (value: string) => void;
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
    <div className="group relative w-full">
      <LeadingIcon>
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
          controlClasses,
          "[&::-webkit-calendar-picker-indicator]:hidden",
          draft ? "pr-7" : "text-ink-tertiary",
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
