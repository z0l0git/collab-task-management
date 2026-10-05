"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type ParamUpdates = Record<string, string | null>;

export const useQueryParams = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const setParams = useCallback(
    (updates: ParamUpdates, history: "push" | "replace" = "replace") => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) next.delete(key);
        else next.set(key, value);
      });
      const query = next.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      router[history](url, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  return { searchParams, setParams };
};
