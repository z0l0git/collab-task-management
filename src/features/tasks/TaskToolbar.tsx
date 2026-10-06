"use client";

import {
  ArrowDownUp,
  Calendar,
  CircleDashed,
  Search,
  SignalHigh,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  activeFilterCount,
  CLEARED_FILTERS,
  DUE_FILTER_LABELS,
  DUE_FILTERS,
  SORT_LABELS,
  TASK_SORTS,
  UNASSIGNED,
  type TaskFilters,
  type TaskSort,
} from "@/lib/utils/taskFilters";
import { PRIORITY_LABELS, TASK_PRIORITIES } from "@/types/task";
import type { Workspace } from "@/types/workspace";

import { PropertyChip } from "./PropertyChip";

type FilterUpdates = Partial<Record<keyof TaskFilters | "sort", string | null>>;

const SEARCH_DELAY_MS = 250;

const iconClasses = "text-ink-subtle size-3.5";

const FilterChip = ({
  label,
  value,
  anyLabel,
  options,
  icon,
  onChange,
}: {
  label: string;
  value: string | null;
  anyLabel: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  icon: ReactNode;
  onChange: (value: string | null) => void;
}) => (
  <PropertyChip
    variant="pill"
    label={label}
    value={value ?? ""}
    options={[{ value: "", label: anyLabel }, ...options]}
    icon={icon}
    onChange={(next) => onChange(next || null)}
    className={cn(
      "max-w-48",
      value ? "border-accent/50 bg-accent/10" : "text-ink-muted",
    )}
  />
);

const SearchField = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);

  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const update = (next: string, delay: number) => {
    setDraft(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(next.trim()), delay);
  };

  return (
    <div className="relative w-full sm:w-56">
      <Search
        aria-hidden="true"
        className="text-ink-subtle pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
      />
      <input
        type="search"
        aria-label="Search tasks"
        placeholder="Search tasks"
        value={draft}
        onChange={(event) => update(event.target.value, SEARCH_DELAY_MS)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && draft) {
            event.preventDefault();
            update("", 0);
          }
        }}
        className="text-caption border-hairline bg-surface-1 text-ink placeholder:text-ink-subtle hover:border-hairline-strong focus-visible:ring-accent-focus h-7 w-full rounded-full border pr-3 pl-7 outline-none focus-visible:ring-2"
      />
    </div>
  );
};

export const TaskToolbar = ({
  workspace,
  filters,
  sort,
  showSort,
  onChange,
}: {
  workspace: Workspace;
  filters: TaskFilters;
  sort: TaskSort;
  showSort: boolean;
  onChange: (updates: FilterUpdates) => void;
}) => {
  const active = activeFilterCount(filters);
  const members = Object.entries(workspace.members).sort(([, a], [, b]) =>
    a.displayName.localeCompare(b.displayName),
  );

  return (
    <div
      role="search"
      aria-label="Filter tasks"
      className="flex flex-wrap items-center gap-2"
    >
      <SearchField
        value={filters.q}
        onChange={(q) => onChange({ q: q || null })}
      />
      <FilterChip
        label="Filter by status"
        anyLabel="Status"
        value={filters.status}
        options={workspace.statuses.map((status) => ({
          value: status.id,
          label: status.name,
        }))}
        icon={<CircleDashed className={iconClasses} aria-hidden="true" />}
        onChange={(status) => onChange({ status })}
      />
      <FilterChip
        label="Filter by priority"
        anyLabel="Priority"
        value={filters.priority}
        options={[...TASK_PRIORITIES].reverse().map((priority) => ({
          value: priority,
          label: PRIORITY_LABELS[priority],
        }))}
        icon={<SignalHigh className={iconClasses} aria-hidden="true" />}
        onChange={(priority) => onChange({ priority })}
      />
      <FilterChip
        label="Filter by assignee"
        anyLabel="Assignee"
        value={filters.assignee}
        options={[
          { value: UNASSIGNED, label: "Unassigned" },
          ...members.map(([uid, member]) => ({
            value: uid,
            label: member.displayName,
          })),
        ]}
        icon={<UserRound className={iconClasses} aria-hidden="true" />}
        onChange={(assignee) => onChange({ assignee })}
      />
      <FilterChip
        label="Filter by due date"
        anyLabel="Due date"
        value={filters.due}
        options={DUE_FILTERS.map((due) => ({
          value: due,
          label: DUE_FILTER_LABELS[due],
        }))}
        icon={<Calendar className={iconClasses} aria-hidden="true" />}
        onChange={(due) => onChange({ due })}
      />
      {workspace.labels.length > 0 ? (
        <FilterChip
          label="Filter by label"
          anyLabel="Label"
          value={filters.label}
          options={workspace.labels.map((label) => ({ value: label, label }))}
          icon={<Tag className={iconClasses} aria-hidden="true" />}
          onChange={(label) => onChange({ label })}
        />
      ) : null}
      {active > 0 ? (
        <button
          type="button"
          onClick={() => onChange(CLEARED_FILTERS)}
          className="text-caption text-ink-subtle hover:text-ink hover:bg-hover inline-flex h-7 items-center gap-1 rounded-full px-2 font-medium transition-colors"
        >
          <X className="size-3.5" aria-hidden="true" />
          Clear
        </button>
      ) : null}
      {showSort ? (
        <span className="sm:ml-auto">
          <PropertyChip
            variant="pill"
            label="Sort tasks"
            value={sort}
            options={TASK_SORTS.map((value) => ({
              value,
              label: SORT_LABELS[value],
            }))}
            icon={<ArrowDownUp className={iconClasses} aria-hidden="true" />}
            onChange={(next) =>
              onChange({ sort: next === "manual" ? null : next })
            }
            className="text-ink-muted"
          />
        </span>
      ) : null}
    </div>
  );
};
