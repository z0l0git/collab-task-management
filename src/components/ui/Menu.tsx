"use client";

import { Check, type LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

const MenuContext = createContext<() => void>(() => undefined);

const itemClasses =
  "text-eyebrow text-ink-muted hover:bg-surface-4 hover:text-ink focus-visible:bg-surface-4 focus-visible:text-ink flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left font-medium outline-none";

export type MenuProps = {
  label: string;
  trigger: ReactNode;
  triggerClassName?: string;
  side?: "top" | "bottom";
  children: ReactNode;
};

export const Menu = ({
  label,
  trigger,
  triggerClassName,
  side = "bottom",
  children,
}: MenuProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const items = () =>
    Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ??
        [],
    );

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('[role^="menuitem"]')?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const onPanelKeyDown = (event: KeyboardEvent) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const focusAt = (next: number) =>
      list[(next + list.length) % list.length]?.focus();

    if (event.key === "ArrowDown") focusAt(index + 1);
    else if (event.key === "ArrowUp") focusAt(index - 1);
    else if (event.key === "Home") focusAt(0);
    else if (event.key === "End") focusAt(list.length - 1);
    else if (event.key === "Escape") close();
    else if (event.key === "Tab") setOpen(false);
    else return;

    if (event.key !== "Tab") event.preventDefault();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-label={label}
          onKeyDown={onPanelKeyDown}
          className={cn(
            "border-hairline bg-surface-3 shadow-modal absolute left-0 z-30 max-h-80 w-full min-w-56 overflow-y-auto rounded-md border p-1",
            side === "bottom" ? "top-full mt-1" : "bottom-full mb-1",
          )}
        >
          <MenuContext.Provider value={() => close(false)}>
            {children}
          </MenuContext.Provider>
        </div>
      ) : null}
    </div>
  );
};

type MenuItemProps = {
  icon?: LucideIcon;
  leading?: ReactNode;
  checked?: boolean;
  children: ReactNode;
} & (
  { href: string; onSelect?: never } | { href?: never; onSelect: () => void }
);

export const MenuItem = ({
  icon: Icon,
  leading,
  checked,
  href,
  onSelect,
  children,
}: MenuItemProps) => {
  const close = useContext(MenuContext);
  const role = checked === undefined ? "menuitem" : "menuitemradio";

  const content = (
    <>
      {Icon ? (
        <Icon className="text-ink-subtle size-4 shrink-0" aria-hidden="true" />
      ) : (
        leading
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {checked ? (
        <Check className="text-ink size-4 shrink-0" aria-hidden="true" />
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        role={role}
        aria-checked={checked}
        tabIndex={-1}
        onClick={close}
        className={itemClasses}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role={role}
      aria-checked={checked}
      tabIndex={-1}
      onClick={() => {
        close();
        onSelect?.();
      }}
      className={itemClasses}
    >
      {content}
    </button>
  );
};

export const MenuDivider = () => (
  <div role="separator" className="bg-hairline -mx-1 my-1 h-px" />
);

export const MenuLabel = ({ children }: { children: ReactNode }) => (
  <div className="text-caption text-ink-subtle truncate px-2 py-1.5">
    {children}
  </div>
);
