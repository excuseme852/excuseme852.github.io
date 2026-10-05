// Immortal performance sequence.
// This module only decides *when* each state starts; CSS decides how it looks.
//   appearing → thinking → reacting → retrieving → presenting → revealing → result
//   Generate Another: result → regenerating → revealing → result
//   Errors: appearing → error (Retry goes straight to thinking)
// The one exception is the plaque's flight from the sleeve to the centre: its start
// point depends on screen size, so it uses the Web Animations API.

import { state, setState } from './state.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Milliseconds. appear = home fade-out + immortal pop. A step of 0 is skipped.
const TIMING = {
  full: { appear: 600, thinkMin: 1500, thinkMax: 2000, react: 500, retrieve: 800, present: 450, reveal: 500 },
  reduced: { appear: 300, thinkMin: 700, thinkMax: 900, react: 0, retrieve: 0, present: 0, reveal: 0 },
};

// Refusals: shorter thinking, slightly longer reaction for the "no" head shake.
const QUICK_THINK = 900;
const QUICK_REACT = 700;

let timers = [];
let onResultCallback = null;
let flight = null;
let pendingError = null; // an error waiting for his entrance to finish

function later(ms, fn) {
  timers.push(setTimeout(fn, ms));
}

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
  pendingError = null;
}

function cancelFlight() {
  flight?.cancel();
  flight = null;
}

function showResult() {
  clearTimers();
  cancelFlight();
  setState({ status: 'result' });
  onResultCallback?.();
}

// Flies the page plaque from the small plaque in the sleeve to its place in the centre.
function presentPlaque(duration) {
  const source = document.querySelector('#immortal #plaque');
  const plaque = document.querySelector('.plaque');
  const from = source?.getBoundingClientRect(); // measure before the small one hides
  setState({ status: 'presenting' });
  if (!from || !from.width || !plaque?.animate) return;

  const to = plaque.getBoundingClientRect();
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const scaleX = from.width / to.width;
  const scaleY = from.height / to.height;

  flight = plaque.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})` },
      { transform: 'none' },
    ],
    { duration, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
  );
}

// Inlines the immortal SVG so its layers (head, eyes, beard...) can be animated by CSS.
export async function loadImmortal(container) {
  try {
    const response = await fetch('./assets/immortal.svg');
    if (!response.ok) throw new Error(`Immortal art failed to load (${response.status})`);
    container.innerHTML = await response.text();
  } catch (error) {
    console.error(error);
  }
}

// Koi drift between lazy and fast swimming. CSS runs the orbit; this only changes
// its speed. All animations of one koi share the same rate, so they stay in sync.
export function startKoiSwimming() {
  if (reducedMotion.matches) return;
  document.querySelectorAll('.koi-track').forEach((track) => {
    const animations = track.getAnimations?.({ subtree: true }) ?? [];
    if (!animations.length) return;

    let rate = 1;
    let target = 1;
    const pickTarget = () => {
      target = 0.4 + Math.random() * 1.8; // 0.4× (lazy) to 2.2× (dash)
      setTimeout(pickTarget, 2000 + Math.random() * 3000);
    };
    pickTarget();

    // Ease toward the target so speed changes feel like swimming, not jumping.
    setInterval(() => {
      rate += (target - rate) * 0.1;
      animations.forEach((animation) => {
        animation.playbackRate = rate;
      });
    }, 100);
  });
}

// The thinking bubble moves on to the next thought every so often (spec 13.7).
const THOUGHT_EVERY = 900;

function showThoughts(thoughts, think) {
  const bubble = document.getElementById('thinking-bubble');
  thoughts.forEach((text, index) => {
    const at = index * THOUGHT_EVERY;
    if (at < think) later(at, () => { bubble.textContent = text; });
  });
}

// `quick`: shorter thinking (used for refusals: he doesn't need to ponder those).
// `thoughts`: lines for the thinking bubble, shown in order.
export function playAskSequence({ onResult, quick = false, thoughts = [] } = {}) {
  clearTimers();
  cancelFlight();
  hidePeek();
  hideSay();
  onResultCallback = onResult;
  const base = reducedMotion.matches ? TIMING.reduced : TIMING.full;
  const timing = quick && base.react ? { ...base, react: QUICK_REACT } : base;
  const think = quick
    ? QUICK_THINK
    : timing.thinkMin + Math.random() * (timing.thinkMax - timing.thinkMin);
  // After an error he's already on stage, so he doesn't pop up again.
  const appear = state.status === 'error' ? 0 : timing.appear;

  // Each step: [how long the previous step lasts, what starts next]
  const steps = [
    [appear, () => {
      setState({ status: 'thinking' });
      showThoughts(thoughts, think);
    }],
    [think, timing.react && (() => setState({ status: 'reacting' }))],
    [timing.react, timing.retrieve && (() => setState({ status: 'retrieving' }))],
    [timing.retrieve, timing.present && (() => presentPlaque(timing.present))],
    [timing.present, timing.reveal && (() => setState({ status: 'revealing' }))],
    [timing.reveal, showResult],
  ];

  if (appear) setState({ status: 'appearing' });
  let at = 0;
  for (const [wait, start] of steps) {
    at += wait;
    if (start) later(at, start);
  }
}

// Something went wrong (spec 13.8): he comes out and says so; the stage offers Retry.
// If he's already showing an error, he just says the new line.
export function playError(text) {
  clearTimers();
  cancelFlight();
  hidePeek();
  hideSay();
  onResultCallback = null;
  const showError = () => {
    clearTimers();
    setState({ status: 'error' });
    say(text, { hold: null });
  };
  if (state.status === 'error') {
    later(250, showError); // the bubble pops again, so a failed Retry is visible
    return;
  }
  setState({ status: 'appearing' });
  pendingError = showError; // the skip arrow jumps straight to it
  later((reducedMotion.matches ? TIMING.reduced : TIMING.full).appear, showError);
}

// Generate Another (spec 13.4): a short version — the plaque flips to its back,
// `update` swaps in the new excuse while it can't be read, then it flips forward again.
const FLIP_BACK = 350;

export function playAnother({ update, onResult } = {}) {
  clearTimers();
  cancelFlight();
  hideSay();
  onResultCallback = onResult;
  if (reducedMotion.matches) {
    update();
    showResult();
    return;
  }
  setState({ status: 'regenerating' });
  later(FLIP_BACK, () => {
    update();
    setState({ status: 'revealing' });
  });
  later(FLIP_BACK + TIMING.full.reveal, showResult);
}

// The immortal says something in a speech bubble on the stage (e.g. "out of ideas").
const SAY_HOLD = 3000;
let sayTimer = null;

// `hold`: ms before the bubble goes, or null to keep it until hideSay().
export function say(text, { hold = SAY_HOLD } = {}) {
  document.getElementById('say-text').textContent = text;
  document.body.dataset.say = 'on';
  clearTimeout(sayTimer);
  if (hold !== null) sayTimer = setTimeout(hideSay, hold);
}

export function hideSay() {
  clearTimeout(sayTimer);
  delete document.body.dataset.say;
}

// Crisis / victim messages: no performance at all, just show the message calmly.
export function showCalmResult({ onResult } = {}) {
  clearTimers();
  cancelFlight();
  hidePeek();
  onResultCallback = onResult;
  showResult();
}

// ---------- Home-screen peek ----------
// The immortal pokes his head over the cloud with a thought bubble, then hides.

const PEEK_HOLD = 4000;
let peekTimer = null;

// `hold`: ms before he hides again, or null to stay until hidePeek() is called.
export function peek(text, { hold = PEEK_HOLD } = {}) {
  if (reducedMotion.matches || document.body.dataset.scene !== 'home') return false;
  document.getElementById('thought-text').textContent = text;
  document.body.dataset.peek = 'on';
  clearTimeout(peekTimer);
  if (hold !== null) peekTimer = setTimeout(hidePeek, hold);
  return true;
}

export function hidePeek() {
  clearTimeout(peekTimer);
  delete document.body.dataset.peek;
}

export function skipToResult() {
  if (pendingError) pendingError();
  else showResult();
}

export function stopSequence() {
  clearTimers();
  cancelFlight();
  hideSay();
  onResultCallback = null;
}
