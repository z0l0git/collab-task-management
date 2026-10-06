"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

type ParamUpdates = Record<string, string | null>;

export const useQueryParams = () => {
  const searchParams = useSearchParams();

  const setParams = useCallback(
    (updates: ParamUpdates, history: "push" | "replace" = "replace") => {
      const next = new URLSearchParams(window.location.search);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) next.delete(key);
        else next.set(key, value);
      });
      const query = next.toString();
      const url = query
        ? `${window.location.pathname}?${query}`
        : window.location.pathname;
      if (history === "push") window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
    },
    [],
  );

  return { searchParams, setParams };
};
