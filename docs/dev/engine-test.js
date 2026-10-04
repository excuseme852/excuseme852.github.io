// Developer test page for js/engine.js (spec 16.3). Not part of the app.

import { loadLibrary, analyze, generateExcuse, fittingExcuses, normalize } from '../js/engine.js';

const MESSAGE_KINDS = ['refused', 'victim', 'support', 'supportUrgent'];
const STYLES = ['polite', 'funny', 'ridiculous'];
const LANGS = ['zh-HK', 'en'];
const TEST_UI_LANG = 'zh-HK'; // used when a test sentence has no clear language
const MIN_PER_STYLE = 5;
const MIN_GENERAL = 3; // untagged lines needed so vague situations still get a fitting excuse

const summary = document.getElementById('summary');
const results = document.getElementById('results');
const coverage = document.getElementById('coverage');
const tryInput = document.getElementById('try-input');
const tryLang = document.getElementById('try-lang');
const tryOutput = document.getElementById('try-output');

// Small DOM helper: el('td', { className: 'ok' }, 'text', childNode)
function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  children.forEach((child) => node.append(child));
  return node;
}

function passes(testCase, result) {
  const { expect, expectLang } = testCase;
  let pass;
  if (expect === 'excuse') pass = result.kind === 'excuse';
  else if (MESSAGE_KINDS.includes(expect)) pass = result.kind === expect;
  else pass = result.kind === 'excuse' && result.category === expect;
  if (expectLang) {
    const wantLang = expectLang === 'uiLang' ? TEST_UI_LANG : expectLang;
    pass = pass && result.lang === wantLang;
  }
  return pass;
}

function outcome(result) {
  if (result.kind === 'excuse') return result.category;
  return result.safety ? `${result.kind} (${result.safety.group}: ${result.safety.keyword})` : result.kind;
}

function scoreDetail(result) {
  const scores = result.scores
    .map((entry) => `${entry.id} ${entry.score} [${entry.hits.join(', ')}]`)
    .join(' · ');
  return `lang ${result.lang}${scores ? ' · ' + scores : ''}`;
}

function renderSection(section) {
  const tbody = el('tbody');
  let passed = 0;
  section.cases.forEach((testCase) => {
    const result = analyze({ situation: testCase.input, uiLang: TEST_UI_LANG, category: testCase.category });
    const pass = passes(testCase, result);
    if (pass) passed += 1;
    let expected = testCase.expectLang ? `${testCase.expect} · ${testCase.expectLang}` : testCase.expect;
    if (testCase.category) expected += ` (picked: ${testCase.category})`;
    tbody.append(
      el('tr', { className: pass ? '' : 'bad-row' },
        el('td', {}, testCase.input),
        el('td', {}, expected),
        el('td', {}, outcome(result)),
        el('td', { className: 'detail' }, scoreDetail(result)),
        el('td', { className: pass ? 'ok' : 'bad' }, pass ? 'PASS' : 'FAIL'),
      ),
    );
  });
  const head = el('thead', {}, el('tr', {}, ...['Input', 'Expected', 'Got', 'Details', ''].map((text) => el('th', {}, text))));
  results.append(
    el('h2', {}, `${section.title} (${passed}/${section.cases.length})`),
    el('div', { className: 'table-wrap' }, el('table', {}, head, tbody)),
  );
  return { passed, total: section.cases.length };
}

// Sub-situation checks: which excuses may be picked for an input.
// Each case: { input, style, include: [text starts], exclude: [text starts] }.
function renderPoolSection(section, library) {
  const tbody = el('tbody');
  let passed = 0;
  section.cases.forEach((testCase) => {
    const result = analyze({ situation: testCase.input, uiLang: TEST_UI_LANG });
    const entries = library.excuses[result.lang].excuses?.[result.category]?.[testCase.style] || [];
    const pool = fittingExcuses(entries, normalize(testCase.input));
    const has = (start) => pool.some((text) => text.startsWith(start));
    const missing = (testCase.include || []).filter((start) => !has(start));
    const unwanted = (testCase.exclude || []).filter(has);
    const pass = !missing.length && !unwanted.length;
    if (pass) passed += 1;
    const detail = [
      `${result.category} · ${testCase.style} · ${pool.length} possible`,
      missing.length ? `missing: ${missing.join(' / ')}` : '',
      unwanted.length ? `should not appear: ${unwanted.join(' / ')}` : '',
    ].filter(Boolean).join(' · ');
    tbody.append(
      el('tr', { className: pass ? '' : 'bad-row' },
        el('td', {}, testCase.input),
        el('td', {}, `${(testCase.include || []).length} in / ${(testCase.exclude || []).length} out`),
        el('td', {}, pass ? 'as expected' : 'wrong pool'),
        el('td', { className: 'detail' }, detail),
        el('td', { className: pass ? 'ok' : 'bad' }, pass ? 'PASS' : 'FAIL'),
      ),
    );
  });
  const head = el('thead', {}, el('tr', {}, ...['Input', 'Expected', 'Got', 'Details', ''].map((text) => el('th', {}, text))));
  results.append(
    el('h2', {}, `${section.title} (${passed}/${section.cases.length})`),
    el('div', { className: 'table-wrap' }, el('table', {}, head, tbody)),
  );
  return { passed, total: section.cases.length };
}

function renderCoverage(library) {
  const ids = [...library.categories.categories.map((category) => category.id), 'general'];
  const tbody = el('tbody');
  ids.forEach((id) => {
    const cells = [];
    LANGS.forEach((lang) => {
      STYLES.forEach((style) => {
        const entries = library.excuses[lang].excuses?.[id]?.[style] || [];
        const general = entries.filter((entry) => typeof entry === 'string').length;
        const label = general < entries.length ? `${entries.length} (${general} general)` : String(entries.length);
        const low = entries.length < MIN_PER_STYLE || (entries.length && general < MIN_GENERAL);
        cells.push(el('td', { className: low ? 'low' : '' }, label));
      });
    });
    tbody.append(el('tr', {}, el('td', {}, id), ...cells));
  });
  const headers = ['Category', ...LANGS.flatMap((lang) => STYLES.map((style) => `${lang} ${style}`))];
  const head = el('thead', {}, el('tr', {}, ...headers.map((text) => el('th', {}, text))));
  coverage.append(el('table', {}, head, tbody));
}

function renderTry() {
  tryOutput.replaceChildren();
  const situation = tryInput.value.trim();
  if (!situation) return;
  const uiLang = tryLang.value;
  const result = analyze({ situation, uiLang });
  tryOutput.append(
    el('p', {}, el('strong', {}, 'Result: '), outcome(result)),
    el('p', { className: 'detail' }, scoreDetail(result)),
  );
  if (result.kind !== 'excuse') {
    tryOutput.append(el('p', {}, generateExcuse({ situation, uiLang }).excuse));
    return;
  }
  STYLES.forEach((style) => {
    const { excuse } = generateExcuse({ situation, style, uiLang });
    tryOutput.append(el('p', {}, el('strong', {}, `${style}: `), excuse));
  });
}

async function run() {
  try {
    const [library, cases] = await Promise.all([
      loadLibrary(),
      fetch('./engine-test-cases.json').then((response) => response.json()),
    ]);
    let passed = 0;
    let total = 0;
    cases.sections.forEach((section) => {
      const counts = section.type === 'pool' ? renderPoolSection(section, library) : renderSection(section);
      passed += counts.passed;
      total += counts.total;
    });
    summary.textContent = `${passed} / ${total} passed`;
    summary.className = `summary ${passed === total ? 'pass' : 'fail'}`;
    renderCoverage(library);
    tryInput.addEventListener('input', renderTry);
    tryLang.addEventListener('change', renderTry);
  } catch (error) {
    summary.textContent = `Error: ${error.message}`;
    summary.className = 'summary fail';
    console.error(error);
  }
}

run();
