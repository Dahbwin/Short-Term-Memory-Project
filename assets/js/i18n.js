// i18n.js - Internationalization system

const LANG_KEY = 'nst_lang';
const DEFAULT_LANG = 'en';

let currentDict = {};

export async function loadLanguage(lang) {
  try {
    const response = await fetch(`./assets/lang/${lang}.json`);
    if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
    currentDict = await response.json();
    localStorage.setItem(LANG_KEY, lang);
    return currentDict;
  } catch (err) {
    console.error('i18n load error:', err);
    // Fallback to English
    if (lang !== 'en') {
      return loadLanguage('en');
    }
    return {};
  }
}

export function getCurrentLang() {
  return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
}

export function t(key) {
  return currentDict[key] || key;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    
    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });
}

export async function setLanguage(lang) {
  await loadLanguage(lang);
  applyTranslations();
  return lang;
}

export async function initI18n() {
  const lang = getCurrentLang();
  await loadLanguage(lang);
  applyTranslations();
}
