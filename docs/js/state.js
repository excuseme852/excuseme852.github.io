// Single source of truth for the app state.
// setState() merges changes and mirrors `status` onto <body data-state>,
// plus <body data-scene="home|stage">, so CSS can react to state changes.

const STAGE_STATUSES = ['appearing', 'thinking', 'reacting', 'retrieving', 'presenting', 'revealing', 'result', 'regenerating'];

export const state = {
  // Home:  loading | idle | input | invalid
  // Stage: appearing | thinking | reacting | retrieving | presenting | revealing | result
  //        regenerating (Generate Another: plaque flips back, then revealing → result)
  status: 'loading',
  situation: '',
  style: 'polite',
  topic: null, // topic the user picked (category id), or null = let the immortal guess
  // normal: playful excuse · serious: safety refusal (no glow) · calm: crisis/victim (no show at all)
  tone: 'normal',
};

export function setState(changes) {
  Object.assign(state, changes);
  document.body.dataset.state = state.status;
  document.body.dataset.scene = STAGE_STATUSES.includes(state.status) ? 'stage' : 'home';
  document.body.dataset.tone = state.tone;
}
