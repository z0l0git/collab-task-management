import { THEME_STORAGE_KEY } from "./themeScript";

export const toggleTheme = () => {
  const dark = document.documentElement.classList.toggle("dark");
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
  } catch {}
};
