"use client";

import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

import { toggleTheme } from "./toggleTheme";

export const ThemeToggle = ({ className }: { className?: string }) => {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
      className={cn(
        "border-hairline bg-surface-1 text-ink-subtle hover:text-ink hover:bg-surface-2",
        "inline-flex size-8 items-center justify-center rounded-md border transition-colors",
        className,
      )}
    >
      <Sun className="size-4 dark:hidden" aria-hidden="true" />
      <Moon className="hidden size-4 dark:block" aria-hidden="true" />
    </button>
  );
};
