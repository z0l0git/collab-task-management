"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

import { TASK_LIMITS, type TaskInput } from "./types";

const fieldClasses =
  "field-sizing-content -mx-2 w-[calc(100%+1rem)] resize-none rounded-md bg-transparent px-2 outline-none transition-colors placeholder:text-ink-tertiary hover:bg-surface-3/50 focus-visible:bg-surface-3/50";

const useInlineDraft = (value: string, commit: (draft: string) => string) => {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  const [editing, setEditing] = useState(false);
  const cancelled = useRef(false);

  if (!editing && value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  const onBlur = () => {
    setEditing(false);
    if (cancelled.current) {
      cancelled.current = false;
      setDraft(value);
      return;
    }
    setDraft(commit(draft));
  };

  const onEscape = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    cancelled.current = true;
    event.currentTarget.blur();
  };

  return {
    draft,
    editing,
    fieldProps: {
      value: draft,
      onChange: (event: { target: { value: string } }) =>
        setDraft(event.target.value),
      onBlur,
    },
    onFocus: () => setEditing(true),
    onEscape,
  };
};

export const InlineTitle = ({
  id,
  value,
  onSave,
}: {
  id: string;
  value: string;
  onSave: (fields: Partial<TaskInput>) => void;
}) => {
  const [error, setError] = useState("");
  const { fieldProps, onFocus, onEscape } = useInlineDraft(value, (draft) => {
    const title = draft.replace(/\s+/g, " ").trim();
    if (!title) {
      setError("A task needs a title");
      return value;
    }
    if (title !== value) onSave({ title });
    return title;
  });

  return (
    <div>
      <textarea
        id={id}
        aria-label="Task title"
        rows={1}
        maxLength={TASK_LIMITS.title}
        {...fieldProps}
        onFocus={() => {
          onFocus();
          setError("");
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
          onEscape(event);
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(fieldClasses, "text-title text-ink py-0.5")}
      />
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-caption text-danger mt-1"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
};

export const InlineDescription = ({
  value,
  onSave,
}: {
  value: string;
  onSave: (fields: Partial<TaskInput>) => void;
}) => {
  const { draft, editing, fieldProps, onFocus, onEscape } = useInlineDraft(
    value,
    (next) => {
      const description = next.trim();
      if (description !== value) onSave({ description });
      return description;
    },
  );
  const nearLimit = draft.length > TASK_LIMITS.description * 0.9;

  return (
    <div>
      <textarea
        aria-label="Description"
        placeholder="Add a description…"
        rows={2}
        maxLength={TASK_LIMITS.description}
        {...fieldProps}
        onFocus={onFocus}
        onKeyDown={onEscape}
        className={cn(
          fieldClasses,
          "text-body text-ink-muted py-1",
          editing && "min-h-24",
        )}
      />
      {nearLimit ? (
        <p className="text-caption text-ink-subtle mt-1 text-right">
          {draft.length} / {TASK_LIMITS.description}
        </p>
      ) : null}
    </div>
  );
};
