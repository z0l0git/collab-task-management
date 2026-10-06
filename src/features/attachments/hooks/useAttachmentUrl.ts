"use client";

import { useEffect, useState } from "react";

import { attachmentUrl } from "@/services/attachmentService";

type UrlState = { url: string | null; failed: boolean };

export const useAttachmentUrl = (storagePath: string) => {
  const [state, setState] = useState<UrlState>({ url: null, failed: false });

  useEffect(() => {
    let active = true;
    attachmentUrl({ storagePath })
      .then((url) => {
        if (active) setState({ url, failed: false });
      })
      .catch(() => {
        if (active) setState({ url: null, failed: true });
      });
    return () => {
      active = false;
    };
  }, [storagePath]);

  return state;
};
