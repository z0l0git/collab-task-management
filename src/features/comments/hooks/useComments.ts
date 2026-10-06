"use client";

import { limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { toUserMessage } from "@/lib/firebase";
import { commentConverter } from "@/lib/firebase/converters/commentConverter";
import { commentsRef } from "@/services/commentService";
import { COMMENTS_PAGE_SIZE, type Comment } from "@/types/comment";

type CommentsState = {
  size: number;
  comments: Comment[];
  hasOlder: boolean;
  error: string;
};

export const useComments = (workspaceId: string, taskId: string) => {
  const [size, setSize] = useState(COMMENTS_PAGE_SIZE);
  const [state, setState] = useState<CommentsState | null>(null);

  useEffect(
    () =>
      onSnapshot(
        query(
          commentsRef(workspaceId, taskId).withConverter(commentConverter),
          orderBy("createdAt", "desc"),
          limit(size),
        ),
        (snapshot) =>
          setState({
            size,
            comments: snapshot.docs.map((entry) => entry.data()).reverse(),
            hasOlder: snapshot.size === size,
            error: "",
          }),
        (error) =>
          setState({
            size,
            comments: [],
            hasOlder: false,
            error: toUserMessage(error, "We couldn't load the comments."),
          }),
      ),
    [workspaceId, taskId, size],
  );

  return {
    comments: state?.comments ?? [],
    hasOlder: state?.hasOlder ?? false,
    error: state?.error ?? "",
    loading: state === null,
    loadingOlder: state !== null && state.size !== size,
    loadOlder: () => setSize((current) => current + COMMENTS_PAGE_SIZE),
  };
};
