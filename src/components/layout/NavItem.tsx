"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const NavItem = ({
  href,
  icon: Icon,
  leading,
  children,
}: {
  href: string;
  icon?: LucideIcon;
  leading?: ReactNode;
  children: ReactNode;
}) => {
  const active = usePathname() === href;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "text-eyebrow flex h-7 items-center gap-2 rounded-md px-2 font-medium transition-colors",
        active
          ? "bg-surface-3 text-ink"
          : "text-ink-subtle hover:bg-surface-2 hover:text-ink",
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : leading}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </Link>
  );
};
