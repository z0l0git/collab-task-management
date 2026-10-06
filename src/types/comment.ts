import type { Timestamp } from "firebase/firestore";

export const COMMENT_MAX_LENGTH = 2000;

export const COMMENTS_PAGE_SIZE = 20;

export type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  message: string;
  createdAt: Timestamp | null;
};
