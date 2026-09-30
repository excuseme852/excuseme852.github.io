// Single source of truth for the app state.
// setState() merges changes and mirrors `status` onto <body data-state>,
// so CSS can react to state changes.

export const state = {
  status: 'loading', // loading | idle | input | invalid | submitted
  situation: '',
  style: 'polite',
};

export function setState(changes) {
  Object.assign(state, changes);
  document.body.dataset.state = state.status;
}
