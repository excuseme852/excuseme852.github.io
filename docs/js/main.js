// Wiring & events for the home screen.

import { detectLang, setLang, getLang, t } from './i18n.js';
import { state, setState } from './state.js';
import {
  loadImmortal, playAskSequence, playAnother, showCalmResult, skipToResult, stopSequence, startKoiSwimming,
  hidePeek, say,
} from './animation.js';
import { loadLibrary, analyze, generateExcuse } from './engine.js';
import { initTopics, topicLabel } from './topics.js';
import { copyText, prepareCard, shareExcuse } from './share.js';
import { feedbackEnabled, feedbackUrl } from './feedback.js';

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
const plaqueLabel = document.getElementById('plaque-label');
const plaqueText = document.getElementById('plaque-text');
const thinkingBubble = document.getElementById('thinking-bubble');
const topicsFieldset = document.getElementById('topics');
const topicOptions = document.getElementById('topic-options');
const askButton = form.querySelector('.ask-button');
const cloud = document.querySelector('.cloud');
const copyButton = document.getElementById('copy-button');
const anotherButton = document.getElementById('another-button');
const shareButton = document.getElementById('share-button');
const toast = document.getElementById('toast');
const feedbackParts = document.querySelectorAll('.feedback');
const feedbackLink = document.getElementById('feedback-link');

const TOAST_TIME = 2600;
let toastTimer = null;

// The excuse currently on the plaque (used by Copy / Another / Share).
let currentResult = null;

// How each engine result is presented (see state.tone).
const TONE_BY_KIND = {
  excuse: 'normal',
  refused: 'serious',
  victim: 'calm',
  support: 'calm',
  supportUrgent: 'calm',
};

// Phone numbers in support messages become tap-to-call links.
const PHONE_PATTERN = /\b(?:999|\d{4} \d{4})\b/g;

// Excuses already shown this session, per language|category|style (spec 13.4: no repeats).
const shown = new Map();

let libraryPromise = null;

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

function sizePlaqueText(lang) {
  const limits = PLAQUE_SIZE_LIMITS[lang] || PLAQUE_SIZE_LIMITS.en;
  const length = plaqueText.textContent.length;
  plaqueText.dataset.size = length > limits.long ? 'long' : length > limits.medium ? 'medium' : 'short';
}

// Loads the excuse library once; if it failed, the next call tries again.
function ensureLibrary() {
  if (!libraryPromise) {
    libraryPromise = loadLibrary().catch((error) => {
      libraryPromise = null;
      throw error;
    });
  }
  return libraryPromise;
}

function setUpTopics() {
  initTopics({
    fieldset: topicsFieldset,
    container: topicOptions,
    input,
    askButton,
    cloud,
    onChange: clearInvalid,
  });
}

function clearInvalid() {
  if (state.status !== 'invalid') return;
  showMessage(null);
  setState({ status: input.value.trim() ? 'input' : 'idle' });
}

// Picks an excuse that hasn't been shown yet for this language / category / style.
function pickExcuse(situation) {
  const options = { situation, style: state.style, uiLang: getLang(), category: state.topic };
  const preview = analyze(options);
  const key = `${preview.lang}|${preview.category}|${state.style}`;
  const previous = shown.get(key) || [];
  const result = generateExcuse({ ...options, previous });
  if (result.kind === 'excuse') {
    shown.set(key, result.exhausted ? [result.excuse] : [...previous, result.excuse]);
  }
  return result;
}

function withPhoneLinks(text) {
  const parts = [];
  let last = 0;
  for (const match of text.matchAll(PHONE_PATTERN)) {
    parts.push(text.slice(last, match.index));
    const link = document.createElement('a');
    link.href = `tel:${match[0].replace(/\s/g, '')}`;
    link.textContent = match[0];
    parts.push(link);
    last = match.index + match[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

function renderPlaque(result) {
  const labelKey = { excuse: 'stage.resultLabel', refused: 'stage.refusedLabel' }[result.kind] || 'stage.seriousLabel';
  plaqueLabel.dataset.i18n = labelKey;
  plaqueLabel.textContent = t(labelKey);
  plaqueText.lang = result.lang;
  plaqueText.replaceChildren(...(result.kind === 'excuse' ? [result.excuse] : withPhoneLinks(result.excuse)));
  sizePlaqueText(result.lang);
}

// "💼 返工……🤔" while thinking, when the topic has a label (not for 其他 / general).
function setThinkingText(result) {
  const topic = result.kind === 'excuse' ? state.topic || result.category : null;
  const label = topic && topic !== 'general' ? topicLabel(topic) : '';
  thinkingBubble.textContent = label ? t('stage.thinkingTopic', { topic: label }) : t('stage.thinking');
}

function showToast(key) {
  toast.textContent = t(key);
  toast.dataset.show = 'true';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.dataset.show = 'false';
  }, TOAST_TIME);
}

function cardDetails() {
  return {
    excuse: currentResult.excuse,
    lang: currentResult.lang,
    label: t('stage.resultLabel'),
    brand: t('share.brand'),
    tagline: t('share.tagline'),
    invite: t('share.invite'),
    fileName: t('share.fileName'),
  };
}

// Runs whenever a plaque is fully revealed.
function afterReveal() {
  plaque.focus();
  if (currentResult?.kind !== 'excuse') return;
  prepareCard(cardDetails()); // draw the share card now, so sharing is instant later
  updateFeedbackLink();
  if (currentResult.exhaustedLine) say(currentResult.exhaustedLine);
}

// Pre-fills the testing feedback form with what was asked and the excuse shown.
function updateFeedbackLink() {
  if (!feedbackEnabled) return;
  const situation = state.situation
    || (state.topic ? t('feedback.topicOnly', { topic: topicLabel(state.topic) }) : '');
  feedbackLink.href = feedbackUrl({ situation, excuse: currentResult.excuse });
  feedbackParts.forEach((part) => { part.hidden = false; });
}

async function onCopy() {
  if (!currentResult) return;
  if (await copyText(currentResult.excuse)) {
    showToast('toast.copied');
    return;
  }
  // Last resort: select the words so the user can copy them by hand.
  const range = document.createRange();
  range.selectNodeContents(plaqueText);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  showToast('toast.copyFailed');
}

function onAnother() {
  if (state.status !== 'result' || currentResult?.kind !== 'excuse') return;
  const result = pickExcuse(state.situation);
  currentResult = result;
  playAnother({ update: () => renderPlaque(result), onResult: afterReveal });
}

async function onShare() {
  if (!currentResult) return;
  shareButton.setAttribute('aria-busy', 'true');
  try {
    const outcome = await shareExcuse(cardDetails());
    if (outcome === 'saved') showToast('toast.shareSaved');
    else if (outcome === 'savedOnly') showToast('toast.shareSavedOnly');
  } catch (error) {
    console.error(error);
    showToast('toast.shareFailed');
  } finally {
    shareButton.removeAttribute('aria-busy');
  }
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
  hidePeek();
}

function onStyleChange(event) {
  if (event.target.name !== 'style') return;
  setState({ style: event.target.value });
  saveStyle(event.target.value);
}

async function onSubmit(event) {
  event.preventDefault();
  const situation = input.value.trim();

  // Text is optional once a topic is picked.
  if (!situation && !state.topic) {
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
  let result;
  try {
    await ensureLibrary();
    setUpTopics();
    result = pickExcuse(situation);
  } catch (error) {
    console.error(error);
    setState({ status: 'invalid' });
    showMessage('errors.libraryLoad', 'error');
    return;
  }

  input.blur(); // closes the phone keyboard so the stage is visible
  currentResult = result;
  setState({ situation, tone: TONE_BY_KIND[result.kind] || 'normal' });
  renderPlaque(result);
  setThinkingText(result);
  if (state.tone === 'calm') showCalmResult({ onResult: afterReveal });
  else playAskSequence({ onResult: afterReveal, quick: state.tone === 'serious' }); // refusals think briefly
}

function onBack() {
  stopSequence();
  toast.dataset.show = 'false';
  setState({ status: input.value.trim() ? 'input' : 'idle', tone: 'normal' });
  input.focus();
}

async function onLangToggle() {
  const nextLang = getLang() === 'zh-HK' ? 'en' : 'zh-HK';
  langToggle.disabled = true;
  try {
    await setLang(nextLang, { remember: true });
    updateCounter();
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

  // Load excuses in the background once the first screen is up (spec 8.4).
  ensureLibrary().then(setUpTopics).catch((error) => console.error(error));

  input.addEventListener('input', onInput);
  form.addEventListener('change', onStyleChange);
  form.addEventListener('submit', onSubmit);
  langToggle.addEventListener('click', onLangToggle);
  skipButton.addEventListener('click', skipToResult);
  backButton.addEventListener('click', onBack);
  copyButton.addEventListener('click', onCopy);
  anotherButton.addEventListener('click', onAnother);
  shareButton.addEventListener('click', onShare);
}

init();
