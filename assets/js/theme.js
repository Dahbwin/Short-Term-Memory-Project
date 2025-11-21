// theme.js - Theme management system

const THEME_KEY = 'nst_theme';
const DEFAULT_THEME = 'dark';

export function getCurrentTheme() {
  return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

export function applyTheme(theme) {
  const body = document.body;
  
  if (theme === 'light') {
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
  } else {
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
  }
}

export function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function initTheme() {
  const theme = getCurrentTheme();
  applyTheme(theme);
}
