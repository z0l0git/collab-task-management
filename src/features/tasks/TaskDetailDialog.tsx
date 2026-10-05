"use client";

import {
  Check,
  ChevronRight,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";

import { Button, Menu, MenuItem, Modal } from "@/components/ui";
import { TaskAttachments } from "@/features/attachments/TaskAttachments";
import { useAuth } from "@/features/auth/AuthProvider";
import { TaskComments } from "@/features/comments/TaskComments";
import { isOwner, type Workspace } from "@/features/workspaces/types";
import { toUserMessage } from "@/lib/firebase";

import { deleteTask } from "./taskService";
import { TaskProperties } from "./TaskProperties";
import type { Task } from "./types";

const iconButtonClasses =
  "text-ink-subtle hover:bg-surface-3 hover:text-ink rounded-md p-1.5 transition-colors";

const DialogHeader = ({
  workspaceName,
  taskTitle,
  onClose,
  children,
}: {
  workspaceName: string;
  taskTitle: string;
  onClose: () => void;
  children?: ReactNode;
}) => (
  <div className="border-hairline flex h-11 shrink-0 items-center gap-1 border-b pr-2 pl-4">
    <nav
      aria-label="Breadcrumb"
      className="text-eyebrow flex min-w-0 flex-1 items-center gap-1.5 font-medium"
    >
      <span className="text-ink-subtle truncate">{workspaceName}</span>
      <ChevronRight
        className="text-ink-tertiary size-3.5 shrink-0"
        aria-hidden="true"
      />
      <span className="text-ink truncate" aria-current="page">
        {taskTitle}
      </span>
    </nav>
    {children}
    <button
      type="button"
      onClick={onClose}
      aria-label="Close task"
      className={iconButtonClasses}
    >
      <X className="size-4" aria-hidden="true" />
    </button>
  </div>
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
  onEdit,
}: {
  workspace: Workspace;
  task: Task | undefined;
  onClose: () => void;
  onEdit: () => void;
}) => {
  const { user } = useAuth();
  const titleId = useId();
  const [shownTask, setShownTask] = useState(task);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

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
          <DialogHeader
            workspaceName={workspace.name}
            taskTitle={current.title}
            onClose={onClose}
          >
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<Pencil className="size-3.5" aria-hidden="true" />}
              onClick={onEdit}
            >
              Edit
            </Button>
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
          </DialogHeader>
        }
        bodyClassName="max-h-[calc(100dvh-8rem)] p-0 md:grid md:h-[min(80vh,48rem)] md:grid-cols-[minmax(0,1fr)_16rem] md:overflow-hidden"
      >
        <div className="min-w-0 space-y-6 px-6 py-6 md:overflow-y-auto md:px-8">
          <div className="space-y-3">
            <h2 id={titleId} className="text-title text-ink break-words">
              {current.title}
            </h2>
            {current.description ? (
              <p className="text-body text-ink-muted break-words whitespace-pre-wrap">
                {current.description}
              </p>
            ) : (
              <p className="text-body text-ink-tertiary">No description</p>
            )}
          </div>
          {error ? (
            <p
              role="alert"
              className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
            >
              {error}
            </p>
          ) : null}
          <div className="border-hairline space-y-6 border-t pt-6">
            <TaskAttachments workspaceId={workspace.id} taskId={current.id} />
            <TaskComments workspace={workspace} taskId={current.id} />
          </div>
        </div>
        <aside
          aria-label="Properties"
          className="border-hairline border-t px-4 py-5 md:overflow-y-auto md:border-t-0 md:border-l"
        >
          <TaskProperties task={current} workspace={workspace} />
        </aside>
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
