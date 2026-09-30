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
