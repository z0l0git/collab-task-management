import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const Card = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "border-hairline bg-surface-1 text-ink rounded-lg border",
        className,
      )}
      {...props}
    />
  );
};

export const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("flex flex-col gap-1.5 px-6 pt-6 pb-3", className)}
      {...props}
    />
  );
};

export const CardTitle = ({
  as: Tag = "h3",
  className,
  children,
}: {
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  children: ReactNode;
}) => {
  return (
    <Tag className={cn("text-card-title text-ink", className)}>{children}</Tag>
  );
};

export const CardDescription = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={cn("text-body-sm text-ink-subtle", className)} {...props} />
  );
};

export const CardContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
};

export const CardFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "border-hairline flex items-center gap-2 border-t px-6 py-3",
        className,
      )}
      {...props}
    />
  );
};
