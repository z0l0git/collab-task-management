"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-5xl max-md:m-0 max-md:h-dvh max-md:max-h-none max-md:w-full max-md:max-w-none max-md:rounded-none max-md:border-0 max-md:open:flex max-md:open:flex-col",
} as const;

type ModalHeading =
  | { title: string; description?: string; header?: never; labelledBy?: never }
  | {
      header: ReactNode;
      labelledBy: string;
      title?: never;
      description?: never;
    };

export type ModalProps = ModalHeading & {
  open: boolean;
  onClose: () => void;
  size?: keyof typeof SIZES;
  footer?: ReactNode;
  bodyClassName?: string;
  children?: ReactNode;
};

export const Modal = ({
  open,
  onClose,
  title,
  description,
  header,
  labelledBy,
  size = "md",
  footer,
  bodyClassName,
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
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
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
      aria-labelledby={labelledBy ?? titleId}
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
      {header ?? (
        <div className="border-hairline flex items-start gap-4 border-b px-6 py-4">
          <div className="flex-1">
            <h2 id={titleId} className="text-card-title text-ink">
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="text-body-sm text-ink-subtle mt-1"
              >
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
      )}

      {children ? (
        <div
          className={cn(
            "max-h-[70vh] overflow-y-auto px-6 py-5",
            bodyClassName,
          )}
        >
          {children}
        </div>
      ) : null}

      {footer ? (
        <div className="border-hairline flex justify-end gap-2 border-t px-6 py-3">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
};
