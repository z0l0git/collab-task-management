import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Spinner } from "./Spinner";

const VARIANTS = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-fill-hover active:bg-accent-fill-active disabled:hover:bg-accent",
  secondary:
    "bg-surface-1 text-ink border border-hairline hover:bg-surface-2 hover:border-hairline-strong disabled:hover:bg-surface-1",
  ghost: "text-ink-subtle hover:bg-hover hover:text-ink",
  danger:
    "bg-danger-solid text-on-danger hover:bg-danger-solid-hover disabled:hover:bg-danger-solid",
} as const;

const SIZES = {
  sm: "h-7 px-2.5 gap-1.5 text-caption font-medium",
  md: "h-8 px-3.5 gap-2 text-button",
  lg: "h-10 px-4 gap-2 text-button",
  icon: "size-8 justify-center",
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  isLoading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        "inline-flex items-center rounded-md transition-colors",
        "disabled:pointer-events-none",
        disabled && !isLoading && "opacity-50",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full justify-center",
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner size="sm" label={null} /> : leadingIcon}
      {children}
      {!isLoading && trailingIcon}
    </button>
  );
};
