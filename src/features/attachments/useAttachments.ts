"use client";

import { onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { toUserMessage } from "@/lib/firebase";

import { attachmentConverter } from "./attachmentConverter";
import { attachmentsRef } from "./attachmentService";
import type { Attachment } from "./types";

type AttachmentsState = {
  attachments: Attachment[];
  loading: boolean;
  error: string;
};

export const useAttachments = (workspaceId: string, taskId: string) => {
  const [state, setState] = useState<AttachmentsState>({
    attachments: [],
    loading: true,
    error: "",
  });

  useEffect(
    () =>
      onSnapshot(
        query(
          attachmentsRef(workspaceId, taskId).withConverter(
            attachmentConverter,
          ),
          orderBy("createdAt", "asc"),
        ),
        (snapshot) =>
          setState({
            attachments: snapshot.docs.map((entry) => entry.data()),
            loading: false,
            error: "",
          }),
        (error) =>
          setState({
            attachments: [],
            loading: false,
            error: toUserMessage(error, "We couldn't load the attachments."),
          }),
      ),
    [workspaceId, taskId],
  );

  return state;
};
