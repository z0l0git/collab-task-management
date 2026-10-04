import { cn } from "@/lib/utils";

const SIZES = {
  20: "size-5 rounded-xs text-[10px]",
  32: "size-8 rounded-sm text-body-sm",
} as const;

export const WorkspaceTile = ({
  name,
  size = 20,
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) => (
  <span
    aria-hidden="true"
    className={cn(
      "bg-surface-4 text-ink ring-hairline-strong inline-flex shrink-0 items-center justify-center font-semibold ring-1",
      SIZES[size],
      className,
    )}
  >
    {name.trim()[0]?.toUpperCase() ?? "?"}
  </span>
);
