// Wiring & events for the home screen.

import { detectLang, setLang, getLang, t } from './i18n.js';
import { state, setState } from './state.js';
import { loadImmortal, playAskSequence, skipToResult, stopSequence, startKoiSwimming } from './animation.js';

const MAX_LENGTH = 100;
const COUNTER_FROM = 50; // show the counter once input reaches this length
const STYLES = ['polite', 'funny', 'ridiculous'];
const STYLE_STORAGE_KEY = 'excuseme.style';

const form = document.getElementById('ask-form');
const input = document.getElementById('situation');
const counter = document.getElementById('char-counter');
const message = document.getElementById('form-message');
const langToggle = document.getElementById('lang-toggle');
const immortal = document.getElementById('immortal');
const skipButton = document.getElementById('skip-button');
const backButton = document.getElementById('back-button');
const plaque = document.getElementById('result-plaque');
const plaqueText = document.getElementById('plaque-text');

// Text length (characters) above which the plaque text steps down a size.
// English words are longer, so English gets higher limits.
const PLAQUE_SIZE_LIMITS = {
  'zh-HK': { medium: 24, long: 48 },
  en: { medium: 60, long: 120 },
};

// Remember which message is showing, so it can be re-translated on language switch.
let messageKey = null;

function showMessage(key, kind) {
  messageKey = key;
  message.textContent = key ? t(key) : '';
  message.dataset.kind = kind || '';
}

function updateCounter() {
  const length = input.value.length;
  counter.hidden = length < COUNTER_FROM;
  counter.textContent = t('home.counter', { count: length, max: MAX_LENGTH });
  counter.dataset.nearLimit = String(length >= MAX_LENGTH - 10);
}

function sizePlaqueText() {
  const limits = PLAQUE_SIZE_LIMITS[getLang()] || PLAQUE_SIZE_LIMITS.en;
  const length = plaqueText.textContent.length;
  plaqueText.dataset.size = length > limits.long ? 'long' : length > limits.medium ? 'medium' : 'short';
}

function readSavedStyle() {
  try {
    return localStorage.getItem(STYLE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveStyle(style) {
  try {
    localStorage.setItem(STYLE_STORAGE_KEY, style);
  } catch {
    // Storage unavailable: ignore.
  }
}

function restoreStyle() {
  const saved = readSavedStyle();
  const style = STYLES.includes(saved) ? saved : 'polite';
  form.elements.style.value = style;
  state.style = style;
}

function onInput() {
  updateCounter();
  const hasText = input.value.trim().length > 0;
  if (state.status === 'invalid') showMessage(null);
  setState({ status: hasText ? 'input' : 'idle' });
}

function onStyleChange(event) {
  if (event.target.name !== 'style') return;
  setState({ style: event.target.value });
  saveStyle(event.target.value);
}

function onSubmit(event) {
  event.preventDefault();
  const situation = input.value.trim();

  if (!situation) {
    setState({ status: 'invalid' });
    showMessage('validation.empty', 'error');
    input.focus();
    return;
  }
  if (situation.length > MAX_LENGTH) {
    setState({ status: 'invalid' });
    showMessage('validation.tooLong', 'error');
    input.focus();
    return;
  }

  showMessage(null);
  input.blur(); // closes the phone keyboard so the stage is visible
  setState({ situation });
  sizePlaqueText();
  playAskSequence({ onResult: () => plaque.focus() });
}

function onBack() {
  stopSequence();
  setState({ status: input.value.trim() ? 'input' : 'idle' });
  input.focus();
}

async function onLangToggle() {
  const nextLang = getLang() === 'zh-HK' ? 'en' : 'zh-HK';
  langToggle.disabled = true;
  try {
    await setLang(nextLang, { remember: true });
    updateCounter();
    sizePlaqueText();
    if (messageKey) message.textContent = t(messageKey);
  } catch (error) {
    console.error(error);
  } finally {
    langToggle.disabled = false;
  }
}

async function init() {
  input.maxLength = MAX_LENGTH;
  restoreStyle();
  loadImmortal(immortal);

  try {
    await setLang(detectLang());
  } catch (error) {
    console.error(error);
    // Fall back to English if the detected locale could not load.
    try {
      await setLang('en');
    } catch (fallbackError) {
      console.error(fallbackError);
    }
  }

  updateCounter();
  setState({ status: input.value.trim() ? 'input' : 'idle' });
  startKoiSwimming();

  input.addEventListener('input', onInput);
  form.addEventListener('change', onStyleChange);
  form.addEventListener('submit', onSubmit);
  langToggle.addEventListener('click', onLangToggle);
  skipButton.addEventListener('click', skipToResult);
  backButton.addEventListener('click', onBack);
}

init();
