"use client";

import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button, Input, Modal, Select, Textarea } from "@/components/ui";
import { TaskAttachments } from "@/features/attachments/TaskAttachments";
import { useAuth } from "@/features/auth/AuthProvider";
import { TaskComments } from "@/features/comments/TaskComments";
import {
  isOwner,
  memberList,
  type Workspace,
} from "@/features/workspaces/types";
import { toUserMessage } from "@/lib/firebase";

import { fromDateInputValue, toDateInputValue } from "./dueDate";
import { LabelPicker } from "./LabelPicker";
import { createTask, deleteTask, updateTask } from "./taskService";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_LIMITS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskInput,
} from "./types";

const STATUS_OPTIONS = TASK_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

const PRIORITY_OPTIONS = TASK_PRIORITIES.map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));

const initialValues = (task?: Task) => ({
  title: task?.title ?? "",
  description: task?.description ?? "",
  status: task?.status ?? "todo",
  priority: task?.priority ?? "medium",
  assigneeId: task?.assigneeId ?? "",
  dueDate: toDateInputValue(task?.dueDate ?? null),
  labels: task?.labels ?? [],
});

type FormValues = ReturnType<typeof initialValues>;

const toInput = (values: FormValues): TaskInput => ({
  title: values.title,
  description: values.description,
  status: values.status,
  priority: values.priority,
  assigneeId: values.assigneeId || null,
  dueDate: fromDateInputValue(values.dueDate),
  labels: values.labels,
});

export const TaskFormDialog = ({
  workspace,
  task,
  onClose,
}: {
  workspace: Workspace;
  task?: Task;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const [values, setValues] = useState(() => initialValues(task));
  const [titleError, setTitleError] = useState("");
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const members = memberList(workspace);
  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...members.map((member) => ({
      value: member.uid,
      label: member.displayName,
    })),
    ...(values.assigneeId && !workspace.memberIds.includes(values.assigneeId)
      ? [{ value: values.assigneeId, label: "Former member" }]
      : []),
  ];

  const canDelete =
    task !== undefined &&
    (task.createdBy === user?.uid || isOwner(workspace, user?.uid));

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    if (!values.title.trim()) {
      setTitleError("Give the task a title.");
      return;
    }

    setTitleError("");
    setFormError("");
    setPending(true);
    try {
      if (task) {
        await updateTask(workspace.id, task.id, toInput(values));
      } else {
        await createTask(workspace.id, user.uid, toInput(values));
      }
      onClose();
    } catch (error) {
      setFormError(toUserMessage(error, "We couldn't save that task."));
      setPending(false);
    }
  };

  const onDelete = async () => {
    if (!task) return;
    setDeleting(true);
    try {
      await deleteTask(workspace.id, task.id);
      onClose();
    } catch (error) {
      setFormError(toUserMessage(error, "We couldn't delete that task."));
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={task ? "Edit task" : "New task"}
        size="lg"
        footer={
          <>
            {canDelete ? (
              <Button
                variant="ghost"
                className="text-danger mr-auto"
                leadingIcon={<Trash2 className="size-4" aria-hidden="true" />}
                onClick={() => setConfirmingDelete(true)}
                disabled={pending}
              >
                Delete
              </Button>
            ) : null}
            <Button variant="ghost" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button form="task-form" type="submit" isLoading={pending}>
              {task ? "Save changes" : "Create task"}
            </Button>
          </>
        }
      >
        <form id="task-form" onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Title"
            value={values.title}
            onChange={(event) => set("title", event.target.value)}
            error={titleError}
            maxLength={TASK_LIMITS.title}
            required
            autoFocus
          />
          <Textarea
            label="Description"
            value={values.description}
            onChange={(event) => set("description", event.target.value)}
            maxLength={TASK_LIMITS.description}
            rows={4}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={values.status}
              onChange={(event) =>
                set("status", event.target.value as FormValues["status"])
              }
            />
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={values.priority}
              onChange={(event) =>
                set("priority", event.target.value as FormValues["priority"])
              }
            />
            <Select
              label="Assignee"
              options={assigneeOptions}
              value={values.assigneeId}
              onChange={(event) => set("assigneeId", event.target.value)}
            />
            <Input
              label="Due date"
              type="date"
              value={values.dueDate}
              onChange={(event) => set("dueDate", event.target.value)}
            />
          </div>
          <LabelPicker
            options={workspace.labels}
            value={values.labels}
            onChange={(labels) => set("labels", labels)}
          />
          {formError ? (
            <p
              role="alert"
              className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
            >
              {formError}
            </p>
          ) : null}
        </form>
        {task ? (
          <div className="border-hairline mt-6 space-y-6 border-t pt-5">
            <TaskAttachments workspaceId={workspace.id} taskId={task.id} />
            <TaskComments workspace={workspace} taskId={task.id} />
          </div>
        ) : null}
      </Modal>

      <Modal
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title="Delete this task?"
        description="It disappears for every member. This cannot be undone."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleting}
              onClick={() => void onDelete()}
            >
              Delete
            </Button>
          </>
        }
      />
    </>
  );
};
