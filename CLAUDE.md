# CLAUDE.md — 藉口生成器 / Excuse Me

Full specification: `spec/MASTER_PROMPT.md`. Read only the sections relevant to the current task.
Current status: `PROGRESS.md`. **Read it at the start of every session.**

## What we are building

A mobile-first **static** web app, deployed for free on GitHub Pages at `https://<account>.github.io`.

A user describes a situation and picks a style (😇 Polite / 😂 Funny / 💀 Ridiculous). A cartoon Chinese immortal thinks, pulls a plaque from his sleeve, flips it, and reveals an excuse engraved on it. The user can then Copy, Generate Another, or Share.

Goal: users smile and think 「哈哈，呢個幾好玩喎。」

The immortal is the heart of the product, not a loading spinner.

## Core constraint: static & free

- Static files only (HTML/CSS/JS/JSON/images). **No backend, server, database, serverless function, paid API, or runtime AI call.** Running cost must be zero.
- Excuses come from a pre-written JSON library (`docs/data/`) and a small in-browser engine (`docs/js/engine.js`). See spec Sections 16–17.
- The user's text never leaves their device.
- If something seems to need a server or paid service, stop and explain the trade-off instead.

## Who you are working with

- The product creator is a **beginner** on Windows, using Claude Code, Cursor, Git, GitHub, and Chrome.
- Explain plans, changes, and test steps in **Traditional Chinese** (Hong Kong Cantonese welcome).
- Code, comments, commit messages, and file names stay in English.

## Tech rules

- Plain HTML + CSS + JavaScript (ES modules). **No framework, no build step, no npm packages** without approval.
- Website lives in `docs/` (GitHub Pages publishes it). The repo is public: never put secrets or private notes anywhere in it, and keep notes/spec outside `docs/`.
- Use relative paths only (`./assets/x.svg`, `./data/categories.json`).
- Mobile-first (360–430 px), 44 px tap targets, input font ≥ 16px, `dvh` + safe-area insets.
- Animations: CSS transitions/keyframes driven by `data-state`. Animate only `transform` and `opacity`. Respect `prefers-reduced-motion`. Thinking pause ~1.5–2.5 s, tap to skip.
- UI text lives in `docs/locales/*.json`; excuse content lives in `docs/data/excuses/*.json`. **No hard-coded UI strings or excuses** in HTML/JS.
- English is first-class and written natively, not translated.
- `localStorage` only for small conveniences, always inside try/catch.
- Keep the engine interface `generateExcuse({ situation, style, uiLang, previous })` stable (spec 16.1).

## How to work

For every major stage:

1. Read `PROGRESS.md`, then inspect only the files you need.
2. Explain the plan in Traditional Chinese, listing the files you will change and why.
3. Make only the changes needed. Use small targeted edits; do not rewrite whole files.
4. Check: serve the page, check the browser console, fix errors.
5. Explain what changed and give step-by-step test instructions.
6. Update `PROGRESS.md` and propose a commit (commit every working step; never commit a broken state).
7. **Wait for confirmation before the next major stage.**

When writing excuse content, work one category at a time. The product creator reviews the Cantonese before it counts as done.

## Strict rules

- MVP first. Do not build features from spec Section 27 unless asked.
- Ask before major, irreversible, or account-related decisions.
- No silent changes to architecture, dependencies, or services. Explain why, what it does, and its cost first.
- Preserve working code. No unrelated refactoring or file churn.
- If something breaks, use Git history to return to the last working state instead of piling on edits.
- When a bug is reported without details, ask for: the console error, a screenshot, and "what I did / expected / got".
