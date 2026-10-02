export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "ctm-theme";

const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

const listeners = new Set<() => void>();

let cachedTheme: Theme | null = null;

function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {}
  return "system";
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeToTheme(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      cachedTheme = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getThemeSnapshot(): Theme {
  cachedTheme ??= readStoredTheme();
  return cachedTheme;
}

export function getThemeServerSnapshot(): Theme {
  return "system";
}

export function setStoredTheme(theme: Theme) {
  cachedTheme = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
  emit();
}

export function subscribeToSystemTheme(listener: () => void) {
  const media = window.matchMedia(SYSTEM_DARK_QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

export function getSystemThemeSnapshot(): ResolvedTheme {
  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? "dark" : "light";
}

export function getSystemThemeServerSnapshot(): ResolvedTheme {
  return "light";
}
