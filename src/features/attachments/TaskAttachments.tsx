"use client";

import {
  ExternalLink,
  FileText,
  Paperclip,
  RotateCw,
  Trash2,
} from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

import { Button, Spinner } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { toUserMessage } from "@/lib/firebase";

import {
  attachmentUrl,
  deleteAttachment,
  uploadAttachment,
} from "./attachmentService";
import { AttachmentThumbnail } from "./AttachmentThumbnail";
import {
  ATTACHMENT_ACCEPT,
  formatBytes,
  isImageAttachment,
  validateAttachment,
  type Attachment,
} from "./types";
import { useAttachments } from "./useAttachments";

type Upload = { file: File; progress: number; error: string };

const iconButton =
  "text-ink-subtle hover:text-ink hover:bg-hover rounded-sm p-1 transition-colors disabled:opacity-50";

export const TaskAttachments = ({
  workspaceId,
  taskId,
}: {
  workspaceId: string;
  taskId: string;
}) => {
  const { user } = useAuth();
  const { attachments, loading, error } = useAttachments(workspaceId, taskId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<Upload | null>(null);
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const uploading = upload !== null && !upload.error;
  const images = attachments.filter(isImageAttachment);
  const files = attachments.filter(
    (attachment) => !isImageAttachment(attachment),
  );

  const start = async (file: File) => {
    if (!user) return;
    setActionError("");
    setUpload({ file, progress: 0, error: "" });
    try {
      await uploadAttachment(workspaceId, taskId, user.uid, file, (progress) =>
        setUpload((current) => current && { ...current, progress }),
      );
      setUpload(null);
    } catch (caught) {
      setUpload({
        file,
        progress: 0,
        error: toUserMessage(caught, "The upload failed."),
      });
    }
  };

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const invalid = validateAttachment(file);
    if (invalid) {
      setUpload(null);
      setActionError(invalid);
      return;
    }
    void start(file);
  };

  const onOpen = async (attachment: Attachment) => {
    setActionError("");
    const opened = window.open("", "_blank");
    if (!opened) {
      setActionError(
        "Your browser blocked the new tab. Allow pop-ups and try again.",
      );
      return;
    }
    opened.opener = null;
    try {
      opened.location.href = await attachmentUrl(attachment);
    } catch (caught) {
      opened.close();
      setActionError(toUserMessage(caught, "We couldn't open that file."));
    }
  };

  const onDelete = async (attachment: Attachment) => {
    setActionError("");
    setDeletingId(attachment.id);
    try {
      await deleteAttachment(workspaceId, taskId, attachment);
    } catch (caught) {
      setActionError(toUserMessage(caught, "We couldn't delete that file."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section aria-labelledby="attachments-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 id="attachments-heading" className="text-eyebrow text-ink-muted">
          Attachments
        </h3>
        <input
          ref={inputRef}
          type="file"
          accept={ATTACHMENT_ACCEPT}
          onChange={onPick}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
        <Button
          variant="secondary"
          leadingIcon={<Paperclip className="size-4" aria-hidden="true" />}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          Attach file
        </Button>
      </div>

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
      ) : attachments.length === 0 && !upload ? (
        <p className="text-body-sm text-ink-subtle">
          No files yet. Images, PDFs, text, CSV and Office files up to 10 MB.
        </p>
      ) : (
        <div className="space-y-3">
          {images.length > 0 ? (
            <ul
              aria-label="Images"
              className="grid grid-cols-3 gap-2 sm:grid-cols-4"
            >
              {images.map((attachment) => (
                <AttachmentThumbnail
                  key={attachment.id}
                  attachment={attachment}
                  deleting={deletingId === attachment.id}
                  onDelete={() => void onDelete(attachment)}
                />
              ))}
            </ul>
          ) : null}
          {files.length > 0 || upload ? (
            <ul className="border-hairline divide-hairline divide-y rounded-md border">
              {files.map((attachment) => (
                <li
                  key={attachment.id}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <FileText
                    className="text-ink-subtle size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm text-ink truncate">
                      {attachment.name}
                    </p>
                    <p className="text-caption text-ink-subtle">
                      {formatBytes(attachment.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void onOpen(attachment)}
                    aria-label={`Open ${attachment.name}`}
                    className={iconButton}
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(attachment)}
                    disabled={deletingId === attachment.id}
                    aria-label={`Delete ${attachment.name}`}
                    className={`${iconButton} hover:text-danger`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
              {upload ? (
                <li className="flex items-center gap-3 px-3 py-2">
                  <FileText
                    className="text-ink-subtle size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm text-ink truncate">
                      {upload.file.name}
                    </p>
                    {upload.error ? (
                      <p role="alert" className="text-caption text-danger">
                        {upload.error}
                      </p>
                    ) : (
                      <div
                        role="progressbar"
                        aria-label={`Uploading ${upload.file.name}`}
                        aria-valuenow={upload.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="bg-surface-4 mt-1.5 h-1 overflow-hidden rounded-full"
                      >
                        <div
                          className="bg-accent h-full transition-[width]"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {upload.error ? (
                    <>
                      <Button
                        variant="ghost"
                        leadingIcon={
                          <RotateCw className="size-4" aria-hidden="true" />
                        }
                        onClick={() => void start(upload.file)}
                      >
                        Retry
                      </Button>
                      <Button variant="ghost" onClick={() => setUpload(null)}>
                        Dismiss
                      </Button>
                    </>
                  ) : (
                    <span className="text-caption text-ink-subtle tabular-nums">
                      {upload.progress}%
                    </span>
                  )}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      )}

      {actionError ? (
        <p
          role="alert"
          className="bg-danger/10 text-danger text-body-sm rounded-md px-3 py-2"
        >
          {actionError}
        </p>
      ) : null}
    </section>
  );
};
