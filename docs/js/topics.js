// Topic buttons on the home screen, plus the immortal peeking over the cloud
// with a thought bubble (his guess, or a gentle hint when nothing is typed).
// A button exists only for categories that have excuses and a label in the locale files;
// buttons follow the order of the labels there.

import { t, hasKey, keysOf, getLang, applyTranslations } from './i18n.js';
import { analyze, availableCategories } from './engine.js';
import { state, setState } from './state.js';
import { peek, hidePeek } from './animation.js';

const GUESS_DELAY = 400; // ms after typing stops before the immortal guesses
const IDLE_PEEK_EVERY = 7000; // hint peeks: up 4 s (animation.js), then hidden 3 s
const FIRST_PEEK_AFTER = 3000;
const PEEK_ROOM = 75; // px needed between the Ask button and the resting cloud (head + bob + margin)
const MAX_SINK_RATIO = 0.7; // how far the cloud may sink on the home screen (short laptops)

let topics = [];
let guess = null;
let idleIndex = 0;
let guessTimer = null;
let elements = null;
let onPickChange = null;

export const topicLabel = (id) => (hasKey(`topic.${id}`) ? t(`topic.${id}`) : '');

let roomGap = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Gap between the Ask button and the cloud, ignoring the cloud's bob and any sink
// (both read from the live styles, so a sink still in transition is handled too).
function restingGap() {
  const group = elements.cloud.parentElement;
  const style = getComputedStyle(group);
  const bob = new DOMMatrixReadOnly(style.transform).m42; // 0 to -10px
  const sinkNow = style.translate === 'none' ? 0 : parseFloat(style.translate.split(' ')[1] || '0');
  const gap = elements.cloud.getBoundingClientRect().top - elements.askButton.getBoundingClientRect().bottom;
  return gap - bob - sinkNow;
}

// On the home screen, sink the cloud just enough to leave room for his head and
// the thought bubble. It rises back when the show starts (CSS: --cloud-sink).
function fitCloud() {
  const group = elements.cloud.parentElement;
  const rest = restingGap();
  const maxSink = reducedMotion.matches ? 0 : group.offsetHeight * MAX_SINK_RATIO;
  const sink = Math.ceil(Math.min(Math.max(PEEK_ROOM - rest, 0), maxSink));
  roomGap = rest + sink;
  document.documentElement.style.setProperty('--cloud-sink', `${sink}px`);
}

// Small screens where even a sunken cloud leaves no room: no peeking.
function hasRoom() {
  return roomGap >= PEEK_ROOM - 1; // 1px slack for sub-pixel layout
}

function peekWith(key, id, options) {
  if (!hasRoom()) return;
  peek(t(key, { topic: topicLabel(id) }), options);
}

function render() {
  elements.container.querySelectorAll('.topic-chip').forEach((button) => {
    const id = button.dataset.topic;
    const picked = state.topic === id;
    const highlighted = picked || (!state.topic && guess === id);
    button.dataset.state = picked ? 'picked' : highlighted ? 'suggested' : '';
    button.setAttribute('aria-pressed', String(picked));
    if (highlighted) scrollIntoRow(button);
  });
}

// Keep the highlighted button visible in the sideways-scrolling row
// (without scrolling the page itself).
function scrollIntoRow(button) {
  const row = elements.container;
  const left = button.offsetLeft - row.offsetLeft;
  const right = left + button.offsetWidth;
  if (left < row.scrollLeft) row.scrollTo({ left: left - 8, behavior: 'smooth' });
  else if (right > row.scrollLeft + row.clientWidth) row.scrollTo({ left: right - row.clientWidth + 24, behavior: 'smooth' });
}

// The engine's guess, limited to topics that have a button.
// Crisis / safety text never shows a guess.
function currentGuess() {
  const situation = elements.input.value.trim();
  if (!situation) return null;
  const result = analyze({ situation, uiLang: getLang() });
  if (result.kind !== 'excuse') return null;
  if (topics.includes(result.category)) return result.category;
  return topics.includes('general') ? 'general' : null;
}

// After typing (and when the keyboard closes) he peeks with his guess and stays
// up until the user asks, picks a topic, or types again (typing hides him).
function updateGuess() {
  guess = currentGuess();
  render();
  if (state.topic) return;
  if (guess) peekWith('home.thoughtGuess', guess, { hold: null });
  else hidePeek();
}

function scheduleGuess() {
  clearTimeout(guessTimer);
  guessTimer = setTimeout(updateGuess, GUESS_DELAY);
}

function onTopicClick(event) {
  const button = event.target.closest('.topic-chip');
  if (!button) return;
  const id = button.dataset.topic;
  setState({ topic: state.topic === id ? null : id });
  hidePeek();
  if (state.topic) {
    render();
    peekWith('home.thoughtPicked', state.topic);
  } else {
    updateGuess(); // un-picked: back to his guess, if there is text
  }
  onPickChange?.();
}

// When nothing is typed or picked, he peeks now and then with the next topic as a hint.
function idlePeek() {
  if (state.topic || elements.input.value.trim() || document.hidden) return;
  if (document.activeElement === elements.input) return;
  const id = topics[idleIndex % topics.length];
  idleIndex += 1;
  peekWith('home.thoughtGuess', id);
}

export function initTopics({ fieldset, container, input, askButton, cloud, onChange }) {
  if (elements) return; // already set up
  // Button order follows the "topic" labels in the locale file.
  const available = availableCategories();
  topics = keysOf('topic').filter((id) => available.includes(id));
  if (!topics.length) return;

  elements = { fieldset, container, input, askButton, cloud };
  onPickChange = onChange;
  container.replaceChildren(
    ...topics.map((id) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'topic-chip';
      button.dataset.topic = id;
      button.dataset.i18n = `topic.${id}`;
      return button;
    }),
  );
  applyTranslations(fieldset);
  fieldset.hidden = false;
  fitCloud();
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitCloud, 200);
  });

  container.addEventListener('click', onTopicClick);
  input.addEventListener('input', scheduleGuess);
  input.addEventListener('blur', () => setTimeout(updateGuess, GUESS_DELAY)); // keyboard closed: room to peek
  setTimeout(() => {
    idlePeek();
    setInterval(idlePeek, IDLE_PEEK_EVERY);
  }, FIRST_PEEK_AFTER);
  updateGuess();
}
