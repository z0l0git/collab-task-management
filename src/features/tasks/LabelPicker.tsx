"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { TASK_LIMITS } from "./types";

export const LabelPicker = ({
  options,
  value,
  onChange,
  compact = false,
}: {
  options: string[];
  value: string[];
  onChange: (labels: string[]) => void;
  compact?: boolean;
}) => {
  const choices = [...new Set([...options, ...value])];
  const full = value.length >= TASK_LIMITS.labels;

  const toggle = (label: string) =>
    onChange(
      value.includes(label)
        ? value.filter((item) => item !== label)
        : [...value, label],
    );

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend
        className={cn(
          "text-eyebrow text-ink-muted mb-1.5",
          compact && "sr-only",
        )}
      >
        Labels
      </legend>
      {choices.length === 0 ? (
        <p className="text-caption text-ink-subtle">
          {compact
            ? "No labels yet"
            : "No labels yet. The workspace owner can add them in settings."}
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {choices.map((label) => {
            const selected = value.includes(label);
            return (
              <button
                key={label}
                type="button"
                aria-pressed={selected}
                disabled={!selected && full}
                onClick={() => toggle(label)}
                className={cn(
                  "text-caption inline-flex items-center gap-1 rounded-full border font-medium transition-colors",
                  compact ? "h-6 px-2" : "px-2.5 py-1",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  selected
                    ? "border-accent bg-accent-soft/10 text-accent-soft"
                    : "border-hairline bg-surface-1 text-ink-muted hover:border-hairline-strong",
                )}
              >
                {selected ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : null}
                {label}
              </button>
            );
          })}
        </div>
      )}
    </fieldset>
  );
};
