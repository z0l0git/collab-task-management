"use client";

import { Trash2 } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";

import { Button, Spinner, Textarea } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import type { Workspace } from "@/features/workspaces/types";
import { toUserMessage } from "@/lib/firebase";

import { addComment, deleteComment } from "./commentService";
import { COMMENT_MAX_LENGTH, type Comment } from "./types";
import { useComments } from "./useComments";

const timeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const CommentItem = ({
  comment,
  canDelete,
  onDelete,
}: {
  comment: Comment;
  canDelete: boolean;
  onDelete: () => void;
}) => (
  <li className="flex gap-3">
    <span
      aria-hidden="true"
      className="bg-surface-4 text-caption text-ink flex size-7 shrink-0 items-center justify-center rounded-full font-medium uppercase"
    >
      {comment.authorName.charAt(0) || "?"}
    </span>
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline gap-2">
        <span className="text-body-sm text-ink font-medium">
          {comment.authorName}
        </span>
        {comment.createdAt ? (
          <time
            dateTime={comment.createdAt.toDate().toISOString()}
            className="text-caption text-ink-subtle"
          >
            {timeFormat.format(comment.createdAt.toDate())}
          </time>
        ) : null}
        {canDelete ? (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete comment"
            className="text-ink-tertiary hover:text-danger ml-auto rounded-sm p-0.5 transition-colors"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <p className="text-body-sm text-ink-muted mt-0.5 wrap-break-word whitespace-pre-wrap">
        {comment.message}
      </p>
    </div>
  </li>
);

export const TaskComments = ({
  workspace,
  taskId,
}: {
  workspace: Workspace;
  taskId: string;
}) => {
  const { user } = useAuth();
  const { comments, hasOlder, error, loading, loadingOlder, loadOlder } =
    useComments(workspace.id, taskId);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState(false);

  const author = user ? workspace.members[user.uid] : undefined;

  const onSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!user || !author || !message.trim()) return;

    setActionError("");
    setPending(true);
    try {
      await addComment(
        workspace.id,
        taskId,
        { uid: user.uid, ...author },
        message,
      );
      setMessage("");
    } catch (caught) {
      setActionError(toUserMessage(caught, "We couldn't post that comment."));
    } finally {
      setPending(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      void onSubmit();
    }
  };

  const onDelete = (commentId: string) => {
    setActionError("");
    deleteComment(workspace.id, taskId, commentId).catch((caught: unknown) =>
      setActionError(toUserMessage(caught, "We couldn't delete that comment.")),
    );
  };

  return (
    <section aria-labelledby="comments-heading" className="space-y-3">
      <h3 id="comments-heading" className="text-eyebrow text-ink-muted">
        Comments
      </h3>

      {loading ? (
        <div className="text-ink-subtle flex justify-center py-4">
          <Spinner />
        </div>
      ) : error ? (
        <p
          role="alert"
          className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
        >
          {error}
        </p>
      ) : (
        <>
          {hasOlder ? (
            <Button
              variant="ghost"
              onClick={loadOlder}
              isLoading={loadingOlder}
            >
              Load older comments
            </Button>
          ) : null}
          {comments.length === 0 ? (
            <p className="text-body-sm text-ink-subtle">
              No comments yet. Start the conversation.
            </p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  canDelete={comment.authorId === user?.uid}
                  onDelete={() => onDelete(comment.id)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <form onSubmit={onSubmit} className="space-y-2">
        <Textarea
          aria-label="Write a comment"
          placeholder="Write a comment…"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={onKeyDown}
          maxLength={COMMENT_MAX_LENGTH}
          rows={2}
        />
        {actionError ? (
          <p
            role="alert"
            className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
          >
            {actionError}
          </p>
        ) : null}
        <div className="flex items-center justify-end gap-3">
          <span className="text-caption text-ink-subtle hidden sm:inline">
            Ctrl/⌘ + Enter to send
          </span>
          <Button
            type="submit"
            variant="secondary"
            isLoading={pending}
            disabled={!message.trim() || !author}
          >
            Comment
          </Button>
        </div>
      </form>
    </section>
  );
};
