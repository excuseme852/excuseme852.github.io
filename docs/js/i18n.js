// UI localization helper.
// Strings live in ./locales/<lang>.json. HTML elements opt in with:
//   data-i18n="key"             → textContent
//   data-i18n-placeholder="key" → placeholder
//   data-i18n-aria-label="key"  → aria-label

export const SUPPORTED_LANGS = ['zh-HK', 'en'];
const STORAGE_KEY = 'excuseme.lang';

let strings = {};
let currentLang = 'en';

function readSavedLang() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage unavailable (private mode, blocked): the app still works.
  }
}

export function detectLang() {
  const saved = readSavedLang();
  if (SUPPORTED_LANGS.includes(saved)) return saved;
  const browserLang = (navigator.language || '').toLowerCase();
  return browserLang.startsWith('zh') ? 'zh-HK' : 'en';
}

export function getLang() {
  return currentLang;
}

// Loads a locale file and applies it to the page.
// `remember` is true only when the user picked the language themselves.
export async function setLang(lang, { remember = false } = {}) {
  const response = await fetch(`./locales/${lang}.json`);
  if (!response.ok) throw new Error(`Locale "${lang}" failed to load (${response.status})`);
  strings = await response.json();
  currentLang = lang;
  document.documentElement.lang = lang;
  applyTranslations();
  if (remember) saveLang(lang);
}

// t('home.counter', { count: 3, max: 100 }) → "3 / 100"
export function t(key, vars) {
  const value = key.split('.').reduce((obj, part) => obj?.[part], strings);
  if (typeof value !== 'string') {
    console.warn(`Missing i18n key: ${key}`);
    return '';
  }
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
}

export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
  });
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
}
