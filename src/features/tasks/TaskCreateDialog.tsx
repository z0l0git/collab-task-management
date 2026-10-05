"use client";

import { UserRound } from "lucide-react";
import { useId, useState, type FormEvent } from "react";

import { Avatar, Button, Modal } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { memberList, type Workspace } from "@/features/workspaces/types";
import { toUserMessage } from "@/lib/firebase";

import { fromDateInputValue } from "./dueDate";
import { LabelPicker } from "./LabelPicker";
import { PriorityIcon } from "./PriorityIcon";
import { PropertyChip, PropertyDateChip } from "./PropertyChip";
import { StatusIcon } from "./StatusIcon";
import { TaskDialogHeader } from "./TaskDialogHeader";
import { createTask } from "./taskService";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_LIMITS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  assigneeOf,
  type TaskPriority,
  type TaskStatus,
} from "./types";

const STATUS_OPTIONS = TASK_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

const PRIORITY_OPTIONS = TASK_PRIORITIES.map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));

const borderless =
  "field-sizing-content w-full resize-none bg-transparent outline-none placeholder:text-ink-tertiary";

export const TaskCreateDialog = ({
  workspace,
  initialStatus,
  onClose,
}: {
  workspace: Workspace;
  initialStatus: TaskStatus;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const formId = useId();
  const headingId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [titleError, setTitleError] = useState("");
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const assignee = assigneeOf(workspace.members, assigneeId || null);
  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...memberList(workspace).map((member) => ({
      value: member.uid,
      label: member.displayName,
    })),
  ];

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || pending) return;

    if (!title.trim()) {
      setTitleError("Give the task a title.");
      return;
    }

    setTitleError("");
    setFormError("");
    setPending(true);
    try {
      await createTask(workspace.id, user.uid, {
        title: title.replace(/\s+/g, " "),
        description,
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate: fromDateInputValue(dueDate),
        labels,
      });
      onClose();
    } catch (error) {
      setFormError(toUserMessage(error, "We couldn't create that task."));
      setPending(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      labelledBy={headingId}
      header={
        <TaskDialogHeader
          workspaceName={workspace.name}
          taskTitle="New task"
          titleId={headingId}
          onClose={onClose}
        />
      }
      bodyClassName="px-6 py-5"
      footer={
        <>
          <p className="text-caption text-ink-subtle mr-auto hidden self-center sm:block">
            Ctrl/⌘ + Enter to create
          </p>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button form={formId} type="submit" isLoading={pending}>
            Create task
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={onSubmit}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            event.currentTarget.requestSubmit();
          }
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <div>
            <textarea
              aria-label="Task title"
              placeholder="Task title"
              rows={1}
              value={title}
              maxLength={TASK_LIMITS.title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (titleError) setTitleError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.metaKey && !event.ctrlKey)
                  event.preventDefault();
              }}
              aria-invalid={titleError ? true : undefined}
              aria-describedby={
                titleError ? `${formId}-title-error` : undefined
              }
              data-autofocus
              className={`${borderless} text-title text-ink`}
            />
            {titleError ? (
              <p
                id={`${formId}-title-error`}
                role="alert"
                className="text-caption text-danger mt-1"
              >
                {titleError}
              </p>
            ) : null}
          </div>
          <textarea
            aria-label="Description"
            placeholder="Add a description…"
            rows={3}
            value={description}
            maxLength={TASK_LIMITS.description}
            onChange={(event) => setDescription(event.target.value)}
            className={`${borderless} text-body text-ink-muted min-h-20`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PropertyChip
            variant="pill"
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            icon={<StatusIcon status={status} />}
            onChange={setStatus}
          />
          <PropertyChip
            variant="pill"
            label="Priority"
            value={priority}
            options={PRIORITY_OPTIONS}
            icon={<PriorityIcon priority={priority} />}
            onChange={setPriority}
          />
          <PropertyChip
            variant="pill"
            label="Assignee"
            value={assigneeId}
            options={assigneeOptions}
            icon={
              assignee ? (
                <Avatar
                  name={assignee.displayName}
                  photoURL={assignee.photoURL}
                  size={16}
                />
              ) : (
                <UserRound
                  className="text-ink-subtle size-3.5"
                  aria-hidden="true"
                />
              )
            }
            onChange={setAssigneeId}
          />
          <PropertyDateChip
            variant="pill"
            label="Due date"
            value={dueDate}
            onChange={setDueDate}
          />
        </div>

        {workspace.labels.length > 0 ? (
          <LabelPicker
            compact
            options={workspace.labels}
            value={labels}
            onChange={setLabels}
          />
        ) : null}

        {formError ? (
          <p
            role="alert"
            className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
          >
            {formError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
};
