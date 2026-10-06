"use client";

import { ChevronRight, Menu as MenuIcon } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useShell } from "./AppShell";

export type Crumb = { label: string; href: string };

export const PanelHeader = ({
  parents = [],
  title,
  actions,
}: {
  parents?: Crumb[];
  title: string;
  actions?: ReactNode;
}) => {
  const { openNav } = useShell();

  return (
    <header className="border-hairline bg-panel sticky top-0 z-20 flex h-11 shrink-0 items-center gap-2 border-b px-2 lg:px-4">
      <button
        type="button"
        onClick={openNav}
        aria-label="Open navigation"
        className="text-ink-subtle hover:text-ink hover:bg-hover rounded-md p-1.5 lg:hidden"
      >
        <MenuIcon className="size-4" aria-hidden="true" />
      </button>
      <div className="text-eyebrow flex min-w-0 flex-1 items-center gap-1.5 font-medium">
        {parents.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center">
            <ol className="flex min-w-0 items-center gap-1.5">
              {parents.map((crumb) => (
                <Fragment key={crumb.href}>
                  <li className="min-w-0">
                    <Link
                      href={crumb.href}
                      className="text-ink-subtle hover:text-ink block truncate transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  </li>
                  <li aria-hidden="true">
                    <ChevronRight className="text-ink-tertiary size-3.5" />
                  </li>
                </Fragment>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1 className="text-ink truncate">{title}</h1>
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
};

export const PanelBody = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div className={cn("flex-1 px-4 py-6 lg:px-8", className)}>{children}</div>
);
