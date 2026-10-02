"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";

import {
  getSystemThemeServerSnapshot,
  getSystemThemeSnapshot,
  getThemeServerSnapshot,
  getThemeSnapshot,
  setStoredTheme,
  subscribeToSystemTheme,
  subscribeToTheme,
  type ResolvedTheme,
  type Theme,
} from "./themeStore";

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    getSystemThemeServerSnapshot,
  );

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  return { theme, resolvedTheme, setTheme: setStoredTheme };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return children;
}

export type { ResolvedTheme, Theme };
