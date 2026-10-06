"use client";

import { Check, Link2, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button, Menu, MenuItem, Modal } from "@/components/ui";
import { AttachmentsUnavailable } from "@/features/attachments/AttachmentsUnavailable";
import { TaskAttachments } from "@/features/attachments/TaskAttachments";
import { useAuth } from "@/features/auth/AuthProvider";
import { TaskComments } from "@/features/comments/TaskComments";
import { attachmentsEnabled, toUserMessage } from "@/lib/firebase";
import { deleteTask } from "@/services/taskService";
import type { Task, TaskInput } from "@/types/task";
import { isOwner, type Workspace } from "@/types/workspace";

import { InlineDescription, InlineTitle } from "./InlineTaskFields";
import { iconButtonClasses, TaskDialogHeader } from "./TaskDialogHeader";
import { TaskProperties } from "./TaskProperties";
import { useTaskAutosave, type SaveStatus } from "./hooks/useTaskAutosave";

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
};

const SaveIndicator = ({ status }: { status: SaveStatus }) => (
  <span
    aria-live="polite"
    className="text-caption text-ink-subtle mr-1 hidden sm:inline"
  >
    {SAVE_LABELS[status]}
  </span>
);

const CopyLinkButton = () => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          void navigator.clipboard
            .writeText(window.location.href)
            .then(() => setCopied(true))
        }
        aria-label="Copy link to task"
        className={iconButtonClasses}
      >
        {copied ? (
          <Check className="text-success size-4" aria-hidden="true" />
        ) : (
          <Link2 className="size-4" aria-hidden="true" />
        )}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </>
  );
};

export const TaskDetailDialog = ({
  workspace,
  task,
  onClose,
}: {
  workspace: Workspace;
  task: Task | undefined;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const titleId = useId();
  const [shownTask, setShownTask] = useState(task);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const autosave = useTaskAutosave(
    workspace.id,
    task?.id ?? shownTask?.id ?? "",
  );

  const save = (fields: Partial<TaskInput>) => void autosave.save(fields);

  if (task && task !== shownTask) setShownTask(task);
  const current = task ?? (deleting ? shownTask : undefined);

  const canDelete =
    current !== undefined &&
    (current.createdBy === user?.uid || isOwner(workspace, user?.uid));

  const onDelete = async () => {
    if (!current) return;
    setDeleting(true);
    try {
      await deleteTask(workspace.id, current.id);
      onClose();
    } catch (deleteError) {
      setError(toUserMessage(deleteError, "We couldn't delete that task."));
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  if (!current) {
    return (
      <Modal
        open
        onClose={onClose}
        size="sm"
        title="Task not found"
        description="This task doesn't exist or was deleted."
        footer={<Button onClick={onClose}>Close</Button>}
      />
    );
  }

  return (
    <>
      <Modal
        open
        onClose={onClose}
        size="xl"
        labelledBy={titleId}
        header={
          <TaskDialogHeader
            workspaceName={workspace.name}
            taskTitle={current.title}
            onClose={onClose}
          >
            <SaveIndicator status={autosave.status} />
            <CopyLinkButton />
            {canDelete ? (
              <Menu
                label="Task actions"
                align="end"
                trigger={
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                }
                triggerClassName={iconButtonClasses}
              >
                <MenuItem
                  icon={Trash2}
                  onSelect={() => setConfirmingDelete(true)}
                >
                  Delete task
                </MenuItem>
              </Menu>
            ) : null}
          </TaskDialogHeader>
        }
        bodyClassName="max-h-[calc(100dvh-8rem)] p-0 max-md:max-h-none max-md:flex-1 md:grid md:h-[min(80vh,48rem)] md:grid-cols-[minmax(0,1fr)_17.5rem] md:grid-rows-[auto_1fr]"
      >
        <div className="min-w-0 px-5 pt-5 md:col-start-1 md:px-8 md:pt-6">
          <InlineTitle id={titleId} value={current.title} onSave={save} />
        </div>
        <aside
          aria-label="Properties"
          className="border-hairline px-5 pt-3 md:col-start-2 md:row-span-2 md:row-start-1 md:border-l md:px-4 md:py-5"
        >
          <div className="md:sticky md:top-0">
            <TaskProperties
              task={current}
              workspace={workspace}
              onSave={save}
            />
          </div>
        </aside>
        <div className="min-w-0 space-y-6 px-5 pt-4 pb-6 md:col-start-1 md:px-8 md:pt-2">
          <InlineDescription value={current.description} onSave={save} />
          {error || autosave.error ? (
            <p
              role="alert"
              className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
            >
              {error || autosave.error}
            </p>
          ) : null}
          <div className="border-hairline space-y-6 border-t pt-6">
            {attachmentsEnabled ? (
              <TaskAttachments workspaceId={workspace.id} taskId={current.id} />
            ) : (
              <AttachmentsUnavailable />
            )}
            <TaskComments workspace={workspace} taskId={current.id} />
          </div>
        </div>
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
