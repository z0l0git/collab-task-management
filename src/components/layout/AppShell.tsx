"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useWorkspaces } from "@/features/workspaces/hooks/useWorkspaces";

import { Sidebar } from "./Sidebar";

const ShellContext = createContext({ openNav: () => {} });

export const useShell = () => useContext(ShellContext);

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { workspaces } = useWorkspaces();
  const drawerRef = useRef<HTMLDialogElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const [navPathname, setNavPathname] = useState(pathname);

  if (pathname !== navPathname) {
    setNavPathname(pathname);
    setNavOpen(false);
  }

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    if (navOpen && !drawer.open) drawer.showModal();
    else if (!navOpen && drawer.open) {
      drawer.close();
      if (document.activeElement === document.body) mainRef.current?.focus();
    }
  }, [navOpen]);

  return (
    <div className="bg-canvas flex h-dvh">
      <a
        href="#main"
        className="bg-surface-3 text-ink text-body-sm sr-only rounded-md px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>

      <aside className="hidden w-60 shrink-0 lg:block">
        <Sidebar workspaces={workspaces} />
      </aside>

      <dialog
        ref={drawerRef}
        aria-label="Navigation"
        onClose={() => setNavOpen(false)}
        onClick={(event) => {
          if (event.target === drawerRef.current) setNavOpen(false);
        }}
        className="bg-canvas text-ink border-hairline backdrop:bg-scrim m-0 h-dvh max-h-none w-72 max-w-[85vw] border-r p-0 lg:hidden"
      >
        {navOpen ? (
          <div className="relative h-full">
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation"
              className="text-ink-subtle hover:text-ink hover:bg-surface-2 absolute top-3.5 right-3 z-10 rounded-md p-1.5"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <Sidebar workspaces={workspaces} />
          </div>
        ) : null}
      </dialog>

      <main
        ref={mainRef}
        id="main"
        tabIndex={-1}
        className="bg-panel lg:border-hairline flex min-w-0 flex-1 flex-col overflow-y-auto outline-none lg:my-2 lg:mr-2 lg:rounded-lg lg:border"
      >
        <ShellContext.Provider value={{ openNav: () => setNavOpen(true) }}>
          {children}
        </ShellContext.Provider>
      </main>
    </div>
  );
};
