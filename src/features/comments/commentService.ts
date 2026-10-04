import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import type { WorkspaceMember } from "@/features/workspaces/types";
import { getFirebaseDb } from "@/lib/firebase";

export const commentsRef = (workspaceId: string, taskId: string) =>
  collection(
    getFirebaseDb(),
    "workspaces",
    workspaceId,
    "tasks",
    taskId,
    "comments",
  );

export const addComment = (
  workspaceId: string,
  taskId: string,
  author: { uid: string } & Pick<WorkspaceMember, "displayName" | "photoURL">,
  message: string,
) =>
  addDoc(commentsRef(workspaceId, taskId), {
    authorId: author.uid,
    authorName: author.displayName,
    authorPhotoURL: author.photoURL,
    message: message.trim(),
    createdAt: serverTimestamp(),
  });

export const deleteComment = (
  workspaceId: string,
  taskId: string,
  commentId: string,
) => deleteDoc(doc(commentsRef(workspaceId, taskId), commentId));
