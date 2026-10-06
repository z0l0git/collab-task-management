"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Modal,
} from "@/components/ui";
import { PropertyChip } from "@/features/tasks/PropertyChip";
import { StatusIcon } from "@/features/tasks/StatusIcon";
import { toUserMessage } from "@/lib/firebase";
import {
  newStatusId,
  STATUS_COLORS,
  STATUS_LIMITS,
  type StatusColor,
  type TaskStatus,
} from "@/lib/utils/statuses";
import { updateStatuses } from "@/services/workspaceService";
import type { Workspace } from "@/types/workspace";

const COLOR_OPTIONS = STATUS_COLORS.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const iconButton =
  "text-ink-subtle hover:bg-hover hover:text-ink rounded-md p-1.5 transition-colors disabled:pointer-events-none disabled:opacity-40";

const nameTaken = (statuses: TaskStatus[], name: string, exceptId?: string) =>
  statuses.some(
    (status) =>
      status.id !== exceptId &&
      status.name.toLowerCase() === name.toLowerCase(),
  );

const StatusRow = ({
  status,
  index,
  statuses,
  onChange,
  onMove,
  onDelete,
}: {
  status: TaskStatus;
  index: number;
  statuses: TaskStatus[];
  onChange: (next: TaskStatus) => void;
  onMove: (offset: -1 | 1) => void;
  onDelete: () => void;
}) => {
  const [name, setName] = useState(status.name);
  const [synced, setSynced] = useState(status.name);
  const [error, setError] = useState("");

  if (status.name !== synced) {
    setSynced(status.name);
    setName(status.name);
  }

  const commitName = () => {
    const trimmed = name.trim();
    if (trimmed === status.name) return;
    if (!trimmed) {
      setName(status.name);
      setError("A status needs a name.");
      return;
    }
    if (nameTaken(statuses, trimmed, status.id)) {
      setError("Another status already has that name.");
      return;
    }
    setError("");
    onChange({ ...status, name: trimmed });
  };

  return (
    <li className="flex flex-wrap items-center gap-2 py-2">
      <StatusIcon status={status} />
      <Input
        className="min-w-32 flex-1"
        aria-label={`Name of ${status.name}`}
        value={name}
        maxLength={STATUS_LIMITS.name}
        error={error}
        onChange={(event) => setName(event.target.value)}
        onBlur={commitName}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      <PropertyChip
        variant="pill"
        label={`Colour of ${status.name}`}
        className="field-sizing-fixed w-24"
        value={status.color}
        options={COLOR_OPTIONS}
        icon={<StatusIcon status={{ ...status, done: false }} />}
        onChange={(color: StatusColor) => onChange({ ...status, color })}
      />
      <label className="text-caption text-ink-muted inline-flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={status.done}
          onChange={(event) =>
            onChange({ ...status, done: event.target.checked })
          }
          className="accent-accent size-3.5"
        />
        Counts as done
      </label>
      <span className="ml-auto flex items-center">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label={`Move ${status.name} up`}
          className={iconButton}
        >
          <ArrowUp className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === statuses.length - 1}
          aria-label={`Move ${status.name} down`}
          className={iconButton}
        >
          <ArrowDown className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={statuses.length === 1}
          aria-label={`Delete ${status.name}`}
          className={`${iconButton} hover:text-danger`}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </span>
    </li>
  );
};

export const StatusesPanel = ({ workspace }: { workspace: Workspace }) => {
  const { statuses } = workspace;
  const [name, setName] = useState("");
  const [inputError, setInputError] = useState("");
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<TaskStatus | null>(null);

  const save = async (next: TaskStatus[]) => {
    setActionError("");
    try {
      await updateStatuses(workspace.id, next);
    } catch (error) {
      setActionError(toUserMessage(error, "We couldn't save the statuses."));
    }
  };

  const onAdd = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setInputError("Enter a status name.");
      return;
    }
    if (nameTaken(statuses, trimmed)) {
      setInputError("That status already exists.");
      return;
    }
    if (statuses.length >= STATUS_LIMITS.count) {
      setInputError(
        `A workspace can have up to ${STATUS_LIMITS.count} statuses.`,
      );
      return;
    }
    setInputError("");
    setPending(true);
    await save([
      ...statuses,
      { id: newStatusId(), name: trimmed, color: "gray", done: false },
    ]);
    setName("");
    setPending(false);
  };

  const replace = (next: TaskStatus) =>
    void save(
      statuses.map((status) => (status.id === next.id ? next : status)),
    );

  const move = (index: number, offset: -1 | 1) => {
    const next = [...statuses];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(index + offset, 0, moved);
    void save(next);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    void save(statuses.filter((status) => status.id !== deleting.id));
    setDeleting(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statuses</CardTitle>
        <CardDescription>
          The board shows one column per status, in this order. Tasks in a
          status marked &ldquo;Counts as done&rdquo; are finished: they stop
          being overdue and count towards progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="divide-hairline divide-y">
          {statuses.map((status, index) => (
            <StatusRow
              key={status.id}
              status={status}
              index={index}
              statuses={statuses}
              onChange={replace}
              onMove={(offset) => move(index, offset)}
              onDelete={() => setDeleting(status)}
            />
          ))}
        </ul>

        <form onSubmit={onAdd} className="flex items-start gap-2">
          <Input
            className="flex-1"
            placeholder="e.g. Backlog, In review"
            aria-label="New status name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={inputError}
            maxLength={STATUS_LIMITS.name}
          />
          <Button
            type="submit"
            isLoading={pending}
            leadingIcon={<Plus className="size-4" aria-hidden="true" />}
          >
            Add
          </Button>
        </form>

        {actionError ? (
          <p
            role="alert"
            className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
          >
            {actionError}
          </p>
        ) : null}
      </CardContent>

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete “${deleting?.name ?? ""}”?`}
        description="Tasks in this status move to a “No status” column until someone picks a new status for them."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete status
            </Button>
          </>
        }
      />
    </Card>
  );
};
