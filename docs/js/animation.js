// Immortal performance sequence.
// This module only decides *when* each state starts; CSS decides how it looks.
//   appearing → thinking → reacting → result

import { setState } from './state.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Milliseconds. appear = home fade-out + immortal pop.
const TIMING = {
  full: { appear: 750, thinkMin: 1500, thinkMax: 2500, react: 400 },
  reduced: { appear: 300, thinkMin: 700, thinkMax: 900, react: 0 },
};

let timers = [];
let onResultCallback = null;

function later(ms, fn) {
  timers.push(setTimeout(fn, ms));
}

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function showResult() {
  clearTimers();
  setState({ status: 'result' });
  onResultCallback?.();
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

export function playAskSequence({ onResult } = {}) {
  clearTimers();
  onResultCallback = onResult;
  const timing = reducedMotion.matches ? TIMING.reduced : TIMING.full;
  const think = timing.thinkMin + Math.random() * (timing.thinkMax - timing.thinkMin);

  setState({ status: 'appearing' });
  later(timing.appear, () => setState({ status: 'thinking' }));
  if (timing.react > 0) {
    later(timing.appear + think, () => setState({ status: 'reacting' }));
  }
  later(timing.appear + think + timing.react, showResult);
}

export function skipToResult() {
  showResult();
}

export function stopSequence() {
  clearTimers();
  onResultCallback = null;
}
