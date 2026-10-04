import Image from "next/image";

import { cn } from "@/lib/utils";

const SIZES = {
  16: "size-4 text-[8px]",
  20: "size-5 text-[9px]",
  24: "size-6 text-[10px]",
  32: "size-8 text-caption",
} as const;

export type AvatarProps = {
  name: string;
  photoURL?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "?";

export const Avatar = ({
  name,
  photoURL,
  size = 20,
  className,
}: AvatarProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "bg-surface-4 text-ink-muted ring-hairline relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold ring-1",
      SIZES[size],
      className,
    )}
  >
    {photoURL ? (
      <Image
        src={photoURL}
        alt=""
        width={size}
        height={size}
        className="size-full object-cover"
      />
    ) : (
      initials(name)
    )}
  </span>
);
