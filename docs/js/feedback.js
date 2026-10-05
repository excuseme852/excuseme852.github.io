// Testing-phase feedback: a link to a Google Form, pre-filled with what the user
// asked and the excuse they got. Nothing is sent unless the user opens the form
// and submits it themselves.

// Paste the form's "Get pre-filled link" here, with SITUATION and EXCUSE typed
// into the two answers. Leave empty to hide the feedback link everywhere.
const FORM_TEMPLATE = 'https://docs.google.com/forms/d/e/1FAIpQLSdBWC_6GuGPvJWdXcvmK67zY7nvX06KPhm-xQeYhMW4rLUnOA/viewform?usp=pp_url&entry.845016753=SITUATION&entry.1998491214=EXCUSE';

export const feedbackEnabled = FORM_TEMPLATE.includes('SITUATION') && FORM_TEMPLATE.includes('EXCUSE');

// Google Forms reads each pre-filled answer from the query string.
export function feedbackUrl({ situation, excuse }) {
  const url = new URL(FORM_TEMPLATE);
  for (const [key, value] of [...url.searchParams]) {
    if (value === 'SITUATION') url.searchParams.set(key, situation);
    else if (value === 'EXCUSE') url.searchParams.set(key, excuse);
  }
  return url.href;
}
