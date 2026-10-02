import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-4 border-2",
  md: "size-5 border-2",
  lg: "size-8 border-[3px]",
} as const;

export type SpinnerProps = {
  size?: keyof typeof SIZES;
  className?: string;
  label?: string | null;
};

export const Spinner = ({
  size = "md",
  className,
  label = "Loading",
}: SpinnerProps) => {
  return (
    <span
      role={label ? "status" : undefined}
      className={cn("inline-flex items-center", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "animate-spin rounded-full border-current border-t-transparent",
          SIZES[size],
        )}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
};
