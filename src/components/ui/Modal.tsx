"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: keyof typeof SIZES;
  footer?: ReactNode;
  children?: ReactNode;
};

export const Modal = ({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  children,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={() => {
        if (open) onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={cn(
        "border-hairline m-auto w-[calc(100%-2rem)] rounded-lg border p-0",
        "bg-surface-2 text-ink shadow-modal",
        "backdrop:bg-scrim",
        SIZES[size],
      )}
    >
      <div className="border-hairline flex items-start gap-4 border-b px-6 py-4">
        <div className="flex-1">
          <h2 id={titleId} className="text-card-title text-ink">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="text-body-sm text-ink-subtle mt-1">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="text-ink-subtle hover:bg-surface-3 hover:text-ink -m-1 rounded-md p-1 transition-colors"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {children ? (
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
      ) : null}

      {footer ? (
        <div className="border-hairline flex justify-end gap-2 border-t px-6 py-3">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
};
