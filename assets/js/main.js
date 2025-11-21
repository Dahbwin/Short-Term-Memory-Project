// main.js - Home page initialization
import { initTheme, toggleTheme } from './theme.js';
import { initI18n } from './i18n.js';

// Initialize theme immediately
initTheme();

// Initialize i18n when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await initI18n();
  
  // Setup theme toggle button
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }
});
