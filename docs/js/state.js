// Single source of truth for the app state.
// setState() merges changes and mirrors `status` onto <body data-state>,
// plus <body data-scene="home|stage">, so CSS can react to state changes.

const STAGE_STATUSES = ['appearing', 'thinking', 'reacting', 'retrieving', 'presenting', 'revealing', 'result'];

export const state = {
  // Home:  loading | idle | input | invalid
  // Stage: appearing | thinking | reacting | retrieving | presenting | revealing | result
  status: 'loading',
  situation: '',
  style: 'polite',
};

export function setState(changes) {
  Object.assign(state, changes);
  document.body.dataset.state = state.status;
  document.body.dataset.scene = STAGE_STATUSES.includes(state.status) ? 'stage' : 'home';
}
