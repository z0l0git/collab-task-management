export const THEME_STORAGE_KEY = "ctm-theme";

export const themeScript = `
try {
  const stored = localStorage.getItem('${THEME_STORAGE_KEY}');
  const dark = stored
    ? stored === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
} catch {}
`;
