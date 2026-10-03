// Excuse engine (spec Section 16). Pure logic: no DOM access.
// Every rule, keyword and category comes from ./data/*.json; nothing here
// names a specific category, so the library can grow without code changes.
//
// Order: crisis support → safety (victim / refusal) → category matching → pick.

const DATA_FILES = {
  categories: 'data/categories.json',
  'zh-HK': 'data/excuses/zh-HK.json',
  en: 'data/excuses/en.json',
};

const FALLBACK_CATEGORY = 'general';
const STYLES = ['polite', 'funny', 'ridiculous'];
const FALLBACK_LANG = 'en';
const DEFAULT_STYLE = 'polite';
const CONTEXT_WINDOW = 15; // characters checked before/after a safety signal
const KEYWORD_POINTS = 2;
const WEAK_KEYWORD_POINTS = 1;

// Message used for each non-excuse outcome, by key in the excuse files.
const MESSAGE_KEYS = {
  refused: 'decline',
  victim: 'victim',
  support: 'support',
  supportUrgent: 'supportUrgent',
};

let library = null;

// Loads categories + both excuse files. Paths resolve from the site root,
// so this works from index.html and from dev/ pages alike.
export async function loadLibrary(baseUrl = new URL('../', import.meta.url)) {
  const fetchJson = async (path) => {
    const response = await fetch(new URL(path, baseUrl));
    if (!response.ok) throw new Error(`Failed to load ${path} (${response.status})`);
    return response.json();
  };
  const [categories, zh, en] = await Promise.all([
    fetchJson(DATA_FILES.categories),
    fetchJson(DATA_FILES['zh-HK']),
    fetchJson(DATA_FILES.en),
  ]);
  library = { categories, excuses: { 'zh-HK': zh, en } };
  return library;
}

// ---------- Text helpers ----------

// Lowercase, full-width → half-width (ＯＴ → ot), curly → straight quotes, single spaces,
// and no spaces next to Chinese characters (唱 K → 唱k, 個 group → 個group).
export function normalize(text) {
  return String(text)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/(\p{Script=Han}) (?=[\p{Script=Han}a-z0-9])/gu, '$1')
    .replace(/([a-z0-9]) (?=\p{Script=Han})/gu, '$1')
    .trim();
}

const isAscii = (text) => /^[\x00-\x7f]*$/.test(text);
const isWordEdge = (text, index) => index < 0 || index >= text.length || !/[a-z0-9]/.test(text[index]);

// Common English endings accepted after a keyword: owe → owes, lend → lending,
// run → running (doubled last letter), stalk → stalked.
const ENGLISH_ENDINGS = ['ing', 'es', 'ed', 's', 'd', ''];

function englishEndingLength(text, end, lastLetter) {
  for (const doubled of [lastLetter, '']) {
    for (const ending of ENGLISH_ENDINGS) {
      const suffix = doubled + ending;
      if (suffix && text.startsWith(suffix, end) && isWordEdge(text, end + suffix.length)) return suffix.length;
    }
  }
  return isWordEdge(text, end) ? 0 : -1;
}

// All positions of a keyword in normalised text. English (ASCII) keywords must be
// whole words (with common endings), so "ot" doesn't match "not"; Chinese keywords
// match anywhere.
function findAll(text, keyword) {
  const needle = normalize(keyword);
  const hits = [];
  if (!needle) return hits;
  const english = isAscii(needle);
  for (let i = text.indexOf(needle); i >= 0; i = text.indexOf(needle, i + 1)) {
    let end = i + needle.length;
    if (english) {
      if (!isWordEdge(text, i - 1)) continue;
      const extra = englishEndingLength(text, end, needle[needle.length - 1]);
      if (extra < 0) continue;
      end += extra;
    }
    hits.push({ start: i, end });
  }
  return hits;
}

const containsKeyword = (text, keywords = []) => keywords.some((keyword) => findAll(text, keyword).length > 0);

// Context cues are looser: plain substring, so "stop" also covers "stopped".
const containsCue = (text, cues = []) => cues.some((cue) => text.includes(normalize(cue)));

// Removes excluded phrases (e.g. "due date") before a category or trigger is checked.
function withoutPhrases(text, phrases = []) {
  return phrases.reduce((result, phrase) => result.split(normalize(phrase)).join(' '), text);
}

// ---------- Steps ----------

// Spec 6.2: 2+ Han characters → Cantonese; else Latin letters → English; else UI language.
export function detectLanguage(text, uiLang) {
  const hanCount = (text.match(/\p{Script=Han}/gu) || []).length;
  if (hanCount >= 2) return 'zh-HK';
  if (/[a-z]/i.test(text)) return 'en';
  return uiLang;
}

function checkSupport(text) {
  const support = library.categories.support;
  if (!support) return null;
  for (const group of support.categories || []) {
    const cleaned = withoutPhrases(text, group.exclude);
    if (containsKeyword(cleaned, group.triggers)) {
      return containsKeyword(text, support.urgentCues) ? 'supportUrgent' : 'support';
    }
  }
  return null;
}

function checkSafety(text) {
  const safety = library.categories.safety;
  if (!safety) return null;
  const weakSignalsCount = containsCue(text, safety.intentCues) && !containsCue(text, safety.discussionCues);
  let victim = null;

  for (const phrase of safety.victimPhrases || []) {
    for (const { start } of findAll(text, phrase)) {
      const before = text.slice(Math.max(0, start - CONTEXT_WINDOW), start);
      if (!containsCue(before, safety.negationCues)) victim = victim || { group: 'victim_phrase', keyword: phrase };
    }
  }

  for (const group of safety.categories || []) {
    const groupText = withoutPhrases(text, group.exclude);
    const signals = [
      ...(group.strong || []).map((keyword) => ({ keyword, strong: true })),
      ...(group.weak || []).map((keyword) => ({ keyword, strong: false })),
    ];
    for (const { keyword, strong } of signals) {
      for (const { start, end } of findAll(groupText, keyword)) {
        const before = groupText.slice(Math.max(0, start - CONTEXT_WINDOW), start);
        const after = groupText.slice(end, end + CONTEXT_WINDOW);
        if (containsCue(before, safety.negationCues)) continue;
        if (isAimedAtUser(keyword, before, after, safety)) {
          victim = victim || { group: group.id, keyword };
          continue;
        }
        if (strong || weakSignalsCount) return { kind: 'refused', group: group.id, keyword };
      }
    }

    // Combos: the parts must appear in this order (偷 … 錢, kill … my mom). A part may be a
    // list meaning "any of these". Treated as strong. Context is judged around the first
    // part; a hit aimed at the user makes it a victim case instead.
    // A combo is a list of parts, or { parts, within } where `within` caps the characters
    // allowed between one part and the next (kill … my mom, not "kill" 40 words earlier).
    for (const combo of group.combos || []) {
      const parts = Array.isArray(combo) ? combo : combo.parts;
      const within = Array.isArray(combo) ? Infinity : combo.within ?? Infinity;
      const label = parts.map((part) => (Array.isArray(part) ? part[0] + '…' : part)).join(' + ');
      let refuse = false;
      for (const first of findAny(groupText, parts[0])) {
        if (!restInOrder(groupText, parts.slice(1), first.end, within)) continue;
        const before = groupText.slice(Math.max(0, first.start - CONTEXT_WINDOW), first.start);
        const after = groupText.slice(first.end, first.end + CONTEXT_WINDOW);
        if (containsCue(before, safety.negationCues)) continue;
        if (isAimedAtUser(first.keyword, before, after, safety)) {
          victim = victim || { group: group.id, keyword: label };
          refuse = false;
          break;
        }
        refuse = true;
      }
      if (refuse) return { kind: 'refused', group: group.id, keyword: label };
    }
  }
  return victim ? { kind: 'victim', ...victim } : null;
}

// Hits for a combo part: one keyword, or a list meaning "any of these".
function findAny(text, part) {
  const options = Array.isArray(part) ? part : [part];
  return options
    .flatMap((keyword) => findAll(text, keyword).map((hit) => ({ ...hit, keyword })))
    .sort((a, b) => a.start - b.start);
}

// True when each remaining part appears, one after another, starting at `from`,
// with at most `within` characters between consecutive parts.
function restInOrder(text, parts, from, within = Infinity) {
  let position = from;
  for (const part of parts) {
    const next = findAny(text, part).find((hit) => hit.start >= position && hit.start - position <= within);
    if (!next) return false;
    position = next.end;
  }
  return true;
}

// The user is on the receiving end: a victim cue just before the signal, "me" just
// after it, or (Chinese) 我 within two characters after it (騷擾我, 偷咗我).
function isAimedAtUser(keyword, before, after, safety) {
  if (containsCue(before, safety.victimCues)) return true;
  if (/(^|[^a-z])me([^a-z]|$)/.test(after)) return true;
  return !isAscii(keyword) && after.slice(0, 2).includes('我');
}

function matchCategory(text) {
  const scores = [];
  library.categories.categories.forEach((category, order) => {
    const cleaned = withoutPhrases(text, category.exclude);

    // Every place each keyword appears, longest first.
    const found = [];
    const collect = (keywords = [], points) => {
      keywords.forEach((keyword) => {
        findAll(cleaned, keyword).forEach((span) => found.push({ keyword, points, ...span }));
      });
    };
    collect(category.keywords, KEYWORD_POINTS);
    collect(category.weakKeywords, WEAK_KEYWORD_POINTS);
    found.sort((a, b) => (b.end - b.start) - (a.end - a.start));

    // A keyword sitting inside a longer matched keyword (屋企 inside 屋企人,
    // late inside running late) doesn't score again. Each keyword counts once.
    const accepted = [];
    const counted = new Set();
    found.forEach((hit) => {
      const inside = accepted.some((other) => hit.start >= other.start && hit.end <= other.end);
      if (inside || counted.has(hit.keyword)) return;
      accepted.push(hit);
      counted.add(hit.keyword);
    });

    const score = accepted.reduce((sum, hit) => sum + hit.points, 0);
    const length = accepted.reduce((sum, hit) => sum + (hit.end - hit.start), 0);
    const hits = accepted.map((hit) => hit.keyword);
    if (score > 0) scores.push({ id: category.id, order, score, length, hits, yieldsTo: category.yieldsTo || [] });
  });

  const scoredIds = new Set(scores.map((entry) => entry.id));
  const eligible = scores.filter((entry) => !entry.yieldsTo.some((id) => scoredIds.has(id)));
  eligible.sort((a, b) => b.score - a.score || b.length - a.length || a.order - b.order);
  return { category: eligible[0]?.id ?? FALLBACK_CATEGORY, scores };
}

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

// Picks something not in `previous`. If the pool is used up, starts again
// (avoiding the most recent one when possible) and reports `exhausted`.
function pickFresh(pool, previous) {
  const fresh = pool.filter((item) => !previous.includes(item));
  if (fresh.length) return { text: randomItem(fresh), exhausted: false };
  const last = previous[previous.length - 1];
  const others = pool.filter((item) => item !== last);
  return { text: randomItem(others.length ? others : pool), exhausted: true };
}

function excusePool(lang, category, style) {
  const excuses = library.excuses[lang].excuses || {};
  const pool = excuses[category]?.[style];
  if (pool?.length) return { pool, from: category };
  // Category not written yet (or no lines in this style): use general.
  return { pool: excuses[FALLBACK_CATEGORY]?.[style] || [], from: FALLBACK_CATEGORY };
}

// ---------- Public API ----------

// Categories that have excuses in every style and every language (general last).
// The home screen shows a topic button only for these.
export function availableCategories() {
  if (!library) return [];
  const ids = [...library.categories.categories.map((category) => category.id), FALLBACK_CATEGORY];
  return ids.filter((id) =>
    Object.values(library.excuses).every((file) => STYLES.every((style) => file.excuses?.[id]?.[style]?.length)),
  );
}

const isKnownCategory = (id) =>
  id === FALLBACK_CATEGORY || library.categories.categories.some((category) => category.id === id);

// Explains how a situation would be handled, without picking an excuse.
// Used by generateExcuse() and by the developer test page.
// `category` (optional) is a topic the user picked; it replaces matching,
// but crisis and safety checks always run first.
export function analyze({ situation, uiLang = FALLBACK_LANG, category: chosen = null }) {
  if (!library) throw new Error('Excuse library not loaded. Call loadLibrary() first.');
  const text = normalize(situation);
  let lang = detectLanguage(text, uiLang);
  if (!library.excuses[lang]) lang = FALLBACK_LANG;

  const supportKind = checkSupport(text);
  if (supportKind) return { lang, kind: supportKind, category: null, scores: [] };

  const safety = checkSafety(text);
  if (safety) return { lang, kind: safety.kind, category: null, scores: [], safety };

  const { category, scores } = matchCategory(text);
  if (chosen && isKnownCategory(chosen)) return { lang, kind: 'excuse', category: chosen, scores, suggested: category };
  return { lang, kind: 'excuse', category, scores };
}

// Spec 16.1 interface, plus optional `category` (user-picked topic) and `kind`:
//   excuse | refused | victim | support | supportUrgent
// `refused` is true whenever no excuse is given (kind tells which message it is).
export function generateExcuse({ situation, style = DEFAULT_STYLE, uiLang = FALLBACK_LANG, previous = [], category = null }) {
  const result = analyze({ situation, uiLang, category });
  const file = library.excuses[result.lang];

  if (result.kind !== 'excuse') {
    const messages = file[MESSAGE_KEYS[result.kind]] || file.decline || [];
    return { excuse: randomItem(messages), lang: result.lang, category: null, refused: true, exhausted: false, kind: result.kind };
  }

  const { pool } = excusePool(result.lang, result.category, style);
  if (!pool.length) throw new Error(`No excuses for ${result.lang} / ${result.category} / ${style}`);
  const { text, exhausted } = pickFresh(pool, previous);
  return { excuse: text, lang: result.lang, category: result.category, refused: false, exhausted, kind: 'excuse' };
}
