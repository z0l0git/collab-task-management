"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui";

export const LoadMoreTasks = ({
  loaded,
  loading,
  auto,
  onLoadMore,
}: {
  loaded: number;
  loading: boolean;
  auto: boolean;
  onLoadMore: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const node = ref.current;
    if (!auto || loading || !node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [auto, loading]);

  return (
    <div
      ref={ref}
      className="text-caption text-ink-subtle mt-4 flex flex-col items-center gap-2"
    >
      <p aria-live="polite">Showing the {loaded} newest tasks.</p>
      <Button
        variant="secondary"
        size="sm"
        isLoading={loading}
        onClick={onLoadMore}
      >
        Load more
      </Button>
    </div>
  );
};
