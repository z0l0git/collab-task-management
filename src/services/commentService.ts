import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase";
import type { WorkspaceMember } from "@/types/workspace";

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
