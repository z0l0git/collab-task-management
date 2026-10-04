import type { Timestamp } from "firebase/firestore";

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

export const ATTACHMENT_ACCEPT = ALLOWED_ATTACHMENT_TYPES.join(",");

export type Attachment = {
  id: string;
  name: string;
  size: number;
  contentType: string;
  storagePath: string;
  uploadedBy: string;
  createdAt: Timestamp | null;
};

export const validateAttachment = (file: { size: number; type: string }) => {
  if (!(ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(file.type)) {
    return "That file type isn't supported. Use an image, PDF, text, CSV or Office file.";
  }
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_ATTACHMENT_BYTES) return "Files can be up to 10 MB.";
  return "";
};

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
