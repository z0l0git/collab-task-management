"use client";

import { ImageOff, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { formatBytes, type Attachment } from "./types";
import { useAttachmentUrl } from "./useAttachmentUrl";

export const AttachmentThumbnail = ({
  attachment,
  deleting,
  onDelete,
}: {
  attachment: Attachment;
  deleting: boolean;
  onDelete: () => void;
}) => {
  const { url, failed } = useAttachmentUrl(attachment.storagePath);
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  const unavailable = failed || broken;

  return (
    <li
      className={cn(
        "group relative min-w-0",
        deleting && "pointer-events-none opacity-50",
      )}
    >
      <a
        href={url ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${attachment.name} (${formatBytes(attachment.size)}) in a new tab`}
        title={attachment.name}
        className="border-hairline bg-surface-3 hover:border-hairline-strong relative block aspect-square overflow-hidden rounded-md border transition-colors"
      >
        {unavailable ? (
          <span className="text-ink-subtle flex size-full flex-col items-center justify-center gap-1">
            <ImageOff className="size-5" aria-hidden="true" />
            <span className="text-caption">Preview unavailable</span>
          </span>
        ) : (
          <>
            {!loaded ? (
              <span
                aria-hidden="true"
                className="bg-surface-4 absolute inset-0 animate-pulse motion-reduce:animate-none"
              />
            ) : null}
            {url ? (
              <Image
                src={url}
                alt=""
                fill
                unoptimized
                sizes="160px"
                onLoad={() => setLoaded(true)}
                onError={() => setBroken(true)}
                className="object-cover"
              />
            ) : null}
          </>
        )}
      </a>
      <p
        aria-hidden="true"
        className="text-caption text-ink-subtle mt-1 truncate"
      >
        {attachment.name}
      </p>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        aria-label={`Delete ${attachment.name}`}
        className="bg-surface-1/90 text-ink-subtle hover:text-danger focus-visible:ring-accent-focus absolute top-1.5 right-1.5 rounded-sm p-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:ring-2 pointer-coarse:opacity-100"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </button>
    </li>
  );
};
