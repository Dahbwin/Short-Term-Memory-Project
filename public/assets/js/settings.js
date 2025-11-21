// settings.js - Settings page with theme, language, and sound controls
import { initTheme, getCurrentTheme, setTheme, toggleTheme } from './theme.js';
import { initI18n, getCurrentLang, setLanguage } from './i18n.js';
import { initSound, getSoundConfig, setSoundEnabled, setSoundVolume } from './sound.js';

// Initialize all systems
initTheme();
initSound();

document.addEventListener('DOMContentLoaded', async () => {
  await initI18n();
  
  // Setup theme toggle in header
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  
  // Theme buttons
  const currentTheme = getCurrentTheme();
  const darkBtn = document.getElementById('theme-dark');
  const lightBtn = document.getElementById('theme-light');
  
  function updateThemeButtons() {
    const theme = getCurrentTheme();
    darkBtn?.classList.toggle('active', theme === 'dark');
    lightBtn?.classList.toggle('active', theme === 'light');
  }
  
  darkBtn?.addEventListener('click', () => {
    setTheme('dark');
    updateThemeButtons();
  });
  
  lightBtn?.addEventListener('click', () => {
    setTheme('light');
    updateThemeButtons();
  });
  
  updateThemeButtons();
  
  // Language buttons
  const currentLang = getCurrentLang();
  const enBtn = document.getElementById('lang-en');
  const ptBtn = document.getElementById('lang-pt');
  
  function updateLangButtons() {
    const lang = getCurrentLang();
    enBtn?.classList.toggle('active', lang === 'en');
    ptBtn?.classList.toggle('active', lang === 'pt');
  }
  
  enBtn?.addEventListener('click', async () => {
    await setLanguage('en');
    updateLangButtons();
  });
  
  ptBtn?.addEventListener('click', async () => {
    await setLanguage('pt');
    updateLangButtons();
  });
  
  updateLangButtons();
  
  // Sound controls
  const soundConfig = getSoundConfig();
  const soundEnableEl = document.getElementById('sound-enable');
  const soundVolumeEl = document.getElementById('sound-volume');
  const volumeDisplayEl = document.getElementById('volume-display');
  
  if (soundEnableEl) {
    soundEnableEl.checked = soundConfig.enabled;
    soundEnableEl.addEventListener('change', (e) => {
      setSoundEnabled(e.target.checked);
    });
  }
  
  if (soundVolumeEl) {
    soundVolumeEl.value = soundConfig.volume;
    if (volumeDisplayEl) {
      volumeDisplayEl.textContent = Math.round(soundConfig.volume * 100) + '%';
    }
    
    soundVolumeEl.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      setSoundVolume(vol);
      if (volumeDisplayEl) {
        volumeDisplayEl.textContent = Math.round(vol * 100) + '%';
      }
    });
  }
  
  // Clear data button
  const clearBtn = document.getElementById('clear-data');
  clearBtn?.addEventListener('click', () => {
    if (confirm('Clear all training data? This cannot be undone.')) {
      // Only clear rounds data, preserve settings
      localStorage.removeItem('nst_rounds_v1');
      alert('Training data cleared.');
      window.location.href = './index.html';
    }
  });
});
