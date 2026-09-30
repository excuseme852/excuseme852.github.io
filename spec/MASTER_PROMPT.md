# MASTER PROMPT — 「藉口生成器」 / EXCUSE ME

You are the primary AI coding agent for this project.

Your job is to help build a real, functional, polished **mobile-first static web application** that is deployed **for free on GitHub Pages** at a URL of the form `https://<account>.github.io`.

The product creator is a beginner. Work incrementally, explain important changes clearly, and avoid unnecessary complexity. Do not build the entire application in one giant operation.

When a requirement is ambiguous, do not silently choose a major architecture, paid service, dependency, or product behavior. Explain the options and ask for confirmation when the decision materially affects the project.

**Communication language:** Explain plans, changes, and test instructions to the product creator in **Traditional Chinese** (Hong Kong Cantonese is welcome). Code, comments, commit messages, and file names stay in English.

---

## 1. CORE CONSTRAINT: STATIC & FREE

This is the most important technical constraint. Every decision must respect it.

- The whole product is **static files only** (HTML, CSS, JavaScript, JSON, images) served by GitHub Pages.
- **No backend, no server, no database, no serverless functions, no paid APIs, no runtime AI calls.**
- Running cost must be **zero**. Nothing may require a credit card.
- Excuses come from a **pre-written excuse library** (JSON files in the repo) and a small **excuse engine** in JavaScript that runs entirely in the user's browser.
- The user's text **never leaves their device**.

If a feature seems to need a server or a paid service, stop and explain the trade-off to the product creator instead of adding it.

---

## 2. TOOLS

The product creator will use:

- Windows PC
- **Claude Code**: primary coding agent
- **Cursor**: IDE for viewing, reviewing, and small manual edits
- **Git**: local version control
- **GitHub**: remote repository and free website hosting (GitHub Pages)
- **Google Chrome**: testing, including DevTools device mode
- A real phone (Android and/or iPhone) for real-device testing

Nothing else is required. Node.js is **not** required.

Claude Code usage counts toward the product creator's Claude Pro plan limits. Work efficiently: inspect only what is needed and avoid regenerating whole files for small changes.

---

## 3. PRODUCT NAME & URL

- Chinese: 「藉口生成器」
- English: **Excuse Me**
- URL: **`https://<account>.github.io`** (a GitHub Pages **user site**)

How a user site works:

- The repository must be named exactly **`<account>.github.io`**, where `<account>` is the GitHub username. Example: account `excuseme` → repository `excuseme.github.io` → `https://excuseme.github.io`.
- Each GitHub account can have only one user site.
- Free GitHub accounts can only publish GitHub Pages from a **public** repository.
- Confirm the actual account name during Phase 1.

All asset and data paths must be **relative** (e.g. `./assets/immortal.svg`, `./data/categories.json`) so the site would also work as a project site (`<account>.github.io/<repo>/`) without changes.

---

## 4. PRODUCT PURPOSE

This is an everyday excuse generator. Generating excuses is not the main goal, though.

**The main goal is to make users smile and enjoy receiving an excuse from a fictional cartoon immortal.**

Flow in one line:

**Situation → Immortal → Plaque → Excuse → Laugh → Copy / Share / Generate Another**

The product should feel like:
「唔係你自己諗藉口，而係仙人幫你賜藉口。」

The user should finish thinking:
「哈哈，呢個幾好玩喎。」

The immortal is the heart and soul of the product. He is **not** a loading spinner or decoration.

The app is both:

- a useful everyday tool, and
- a playful entertainment experience worth sharing with friends.

Example situations:

- 「我唔想去朋友生日飯，但又唔想佢覺得我唔重視佢。」
- 「我唔想借架車俾朋友。」
- 「我唔想覆某個人的訊息。」
- "I want to cancel a date."

---

## 5. TARGET USERS

Young adults and mobile users who enjoy humor, memes, messaging apps, and sharing funny content.

The app should feel especially natural to Hong Kong users, but it serves an international audience. English must be a fully natural, first-class experience.

Because it is a web app, most users will arrive **by tapping a shared link** inside WhatsApp, Instagram, Threads, etc. The first screen must load fast and make sense immediately.

---

## 6. LANGUAGE SUPPORT

### 6.1 Supported languages

- UI: **繁體中文 (zh-HK)** and **English (en)**
- Excuse library: **Hong Kong Cantonese** and **English**
- Input: Chinese, Cantonese, English, or mixed (e.g. 「我唔想去 John 個 birthday party」)

### 6.2 Excuse output language

The excuse language follows the **user's input**:

- Input contains **2 or more Chinese (Han) characters** → Cantonese excuse.
- Otherwise, if it contains Latin letters → English excuse.
- If unclear (e.g. only emoji) → follow the current UI language.

The Chinese and English libraries are **written independently**. They do not need to be translations of each other, and should not be.

### 6.3 UI language

- Default UI language: detect from `navigator.language`. Anything starting with `zh` uses zh-HK; everything else uses English.
- Provide a visible language toggle. Remember the choice in `localStorage`, wrapped in try/catch; the app must still work if storage is unavailable.
- Set `<html lang>` to match the current language.
- Layouts must survive both short Chinese strings and longer English strings.

### 6.4 Excuse styles (localized labels)

- 😇 禮貌 / Polite: natural, respectful, reasonably believable
- 😂 搞笑 / Funny: playful, still potentially usable
- 💀 離譜 / Ridiculous: exaggerated, mainly for entertainment

The three styles must feel clearly different.

---

## 7. CORE USER EXPERIENCE

```
User enters situation
↓
User chooses style
↓
User asks the immortal
↓
Cartoon immortal appears
↓
Immortal thinks (short dramatic pause)
↓
Immortal retrieves plaque from his sleeve
↓
Plaque faces backward
↓
Plaque moves to the center
↓
Plaque flips horizontally
↓
Excuse is revealed, engraved on the plaque
↓
Copy / Generate Another / Share
```

Never reduce this to: Input → Text.

Because the excuse engine is instant, the "thinking" moment is a **deliberate, short performance**, not a real wait:

- Thinking lasts about **1.5–2.5 seconds** (slightly randomized so it does not feel mechanical).
- The full sequence from tap to readable excuse should stay under about **4 seconds**.
- The user can **tap to skip** straight to the revealed plaque.
- "Generate Another" uses a **shorter** version of the sequence (e.g. the plaque flips back, then forward again).
- With `prefers-reduced-motion`, use simple fades and keep the pause short.

---

## 8. WEB PLATFORM REQUIREMENTS

### 8.1 Technology

- **Plain HTML, CSS, and JavaScript (ES modules)**
- **No framework and no build step**, so GitHub Pages serves files directly and the product creator can read every file.
- Do not add npm packages or CDN libraries without first explaining:
  - why it is needed,
  - what it does, and
  - what it costs in size and maintenance.
- Prefer built-in browser APIs.

### 8.2 Mobile-first, responsive

- Design for phone portrait first (360–430 px wide), then make sure it looks good on tablets and desktop. On desktop it can be a centered phone-width column.
- Use `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Use `dvh` / safe-area insets so the mobile browser address bar and notches do not hide buttons.
- Tap targets are at least 44×44 px.
- The input must not trigger iOS zoom: font-size ≥ 16px.

### 8.3 Browser support

Latest versions of:

- Chrome (Android + desktop)
- Safari (iOS + macOS)
- Samsung Internet
- Edge
- Firefox

Also make sure it works inside **in-app browsers** (WhatsApp, Instagram, Threads, Facebook), because shared links open there. Feature-detect instead of browser-sniffing.

### 8.4 Performance

- First visit should be usable within ~2 seconds on a normal 4G phone.
- Total initial page weight target: **under ~1 MB**.
- Illustrations:
  - Prefer **SVG**; use WebP for raster art.
  - Lazy-load anything not needed on first screen.
- Excuse data files load in the background right after the first screen renders. Keep them small (target under ~150 KB total).
- **Chinese web fonts are very large.** Use system fonts by default. A decorative font (e.g. for the plaque) is allowed only if subset to the needed characters or loaded from Google Fonts with `display=swap`; explain the trade-off first.

### 8.5 Accessibility

- Respect `prefers-reduced-motion`: replace big movements and flips with simple fades.
- Meaningful `alt` / `aria-label` text, localized.
- Result text must be real text, not text baked into an image, so it can be read, selected, and copied.
- Sufficient color contrast on the plaque.

### 8.6 Add to Home Screen (light PWA)

PWA support is an optional enhancement, not a requirement for using the product.

- The web app must be fully functional without installation.
- Include a `manifest.webmanifest` and appropriate app icons so users can optionally "Add to Home Screen".
- Do not block or pressure users with an install prompt.
- A service worker / offline mode is a **future feature**; do not add it in the MVP.

### 8.7 Link previews

Add Open Graph and Twitter meta tags (title, description, preview image) so the link looks attractive when pasted into WhatsApp, Instagram, Threads, etc. This is part of the sharing experience.

---

## 9. VISUAL DESIGN

Combine:

- Modern mobile web aesthetics
- 2D cartoon illustration
- Chinese-immortal / mythology elements
- Contemporary Hong Kong humor
- Bright playful colors
- A touch of mystery
- Clean readable UI

It should feel fun, friendly, memorable, and slightly mischievous.

It should **not** look like:

- A historical drama
- A fantasy RPG
- A dark fantasy game
- A complicated 3D game
- A generic AI chatbot
- A serious mythology app

---

## 10. THE CARTOON IMMORTAL

The reference image guides the direction. It is stored at **`spec/reference/immortal-reference.png`** (outside `docs/`, so it is not published as part of the website).

- Phases 4–5 do **not** need it: the placeholder SVG only needs to follow the description below.
- It **is required before Phase 11** (final assets). If the file is missing when Phase 11 starts, stop and ask the product creator to add it.

Direction:

- Cute cartoon Chinese immortal, elderly
- Bald head, long white beard and moustache
- Colorful traditional robe and accessories
- Wooden staff and gourd
- Cheerful expression
- Bright 2D cartoon style
- A large koi fish as a secondary visual element

**Personality:** wise, friendly, calm, playful, slightly cheeky, experienced ("he has seen every excuse before"), humorous. He can react subtly (confused, amused, surprised, thoughtful).

**Style:**

- Use clear shapes, an expressive face, a readable silhouette, and harmonious bright colors.
- Avoid photorealism, realistic skin or fabric, horror, complicated 3D, RPG/boss aesthetics, and an intimidating look.

**Original character:** must be an original design. Do not reproduce any specific historical, religious, or copyrighted character. The reference guides proportions, clothing, color, expression, and feeling only.

**Koi:** visually secondary. No complex animation in the MVP.

**Placeholders:** until final art exists (Phase 11), use a simple original SVG immortal built in layers so parts can animate separately:

- body
- head / face
- eyes
- beard
- sleeve / arm
- plaque

The placeholder immortal is only for building and testing the interaction. Do not treat it as the final character artwork, and do not invent a completely different visual identity during implementation. The final character artwork will be supplied or separately approved by the product creator.

---

## 11. IMMORTAL ANIMATION (CSS-first)

Sequence:

1. Immortal appears.
2. Immortal pauses and thinks.
3. Subtle reaction.
4. Reaches into sleeve.
5. Retrieves plaque.
6. Presents plaque.

Implement with **CSS transitions and keyframes** (fade, scale, translate, rotate, `rotateY` flip) driven by state classes set from JavaScript, e.g. `data-state="thinking"`.

Use the Web Animations API only where CSS alone is awkward. No animation libraries, canvas game engines, or WebGL in the MVP.

Animations should feel smooth, playful, and quick. Target 60 fps on mid-range phones by animating only `transform` and `opacity`.

---

## 12. THE PLAQUE & SIGNATURE REVEAL

Visual direction: a wooden plaque, jade plaque, ancient command tablet, or talisman-style plaque. Keep it simple enough for a phone screen.

The excuse appears **engraved / carved / inscribed**, using CSS text-shadow or inset effects, while staying highly readable.

Reveal:

1. The back of the plaque faces the user.
2. The plaque moves to the center.
3. It flips horizontally with CSS 3D: `perspective`, `transform-style: preserve-3d`, `backface-visibility: hidden`.
4. The front shows the excuse.

The plaque must resize for long text (long English excuses especially) without overflowing. Scale the font within limits, then allow the plaque to grow.

The feeling: 「仙人正式賜咗一個藉口俾你。」 Keep the equivalent feeling in English, written naturally rather than translated literally.

---

## 13. MVP FEATURES

### 13.1 Home screen

- Prompt: 「今日發生咩事？」 / "What happened today?"
- Free-text situation input. No forced predefined situations.
- Three-style selector
- "Ask the immortal" button
- Language toggle

### 13.2 Input rules

- Empty input shows a humorous localized message:
  - 「仙人都唔知道發生咩事喎 😂」
  - "Even the immortal has no idea what happened 😂"
- Limit input length (about 300 characters) and show a gentle counter near the limit.

### 13.3 Excuse generation

Handled entirely in the browser by the excuse engine (Section 16), using the library (Section 17).

Each excuse is:

- short (Chinese ~30–80 characters; English natural text-message length)
- natural and contemporary
- copy-ready: only the excuse itself, no explanations or quotation marks
- matching the selected style
- relevant to the detected situation category

### 13.4 Generate Another

Same situation, style, and language, but a **different excuse** from the same category and style.

- Never repeat an excuse within the session until all options in that category/style are used.
- When all options are used, the immortal shows a playful "out of ideas" line (e.g. 「仙人都諗到詞窮喇……再嚟過！」 / a natural English equivalent) and the pool reshuffles.

### 13.5 Copy

- Use `navigator.clipboard.writeText()`, with a fallback for older or in-app browsers.
- Show a short localized toast:
  - 「仙旨已抄錄。」
  - A natural English equivalent, e.g. "Decree copied."

### 13.6 Share

Create a **share card image** in the browser using the Canvas API. It contains:

- the immortal
- the plaque
- the excuse
- app branding
- the site URL

It does **not** include the user's typed situation (privacy, and it keeps shared images clean).

Sharing logic:

1. Feature-detect `navigator.share`.
2. Feature-detect `navigator.canShare({ files })` before attempting file sharing.
3. If file sharing is supported, share the image through the native share sheet together with the site link.
4. If file sharing is unavailable, fall back cleanly to:
   - downloading the image;
   - copying the excuse text; and
   - copying the site link.
5. Never assume that Web Share API support means file sharing is supported.

The share card must support both Chinese and English and handle long text.

Note for Canvas: images drawn onto it must be same-origin (local files in the repo) so the canvas can be exported.

### 13.7 Thinking messages (localized, rotating)

Shown during the immortal's thinking pause:

- 「仙人正在思考……」 / "The immortal is thinking..."
- 「正在翻閱天書……」 / "Consulting the heavenly scrolls..."
- 「正在尋找一個比較可信的理由……」 / "Hunting for a semi-believable excuse..."
- 「仙人表示此事有點複雜……」 / "The immortal says this one's… complicated."

Never show a bare "Loading...".

### 13.8 Errors

With no server, errors are rare but still need friendly handling. Use humorous, localized messages with a clear **Retry** button:

- 「天書暫時打唔開。」 / "The heavenly scrolls won't open right now."

Handle:

- excuse data files failing to load (e.g. offline on first visit, bad network)
- invalid or corrupted data file
- unexpected JavaScript errors in the engine
- clipboard or share failures (show the fallback instead)

Never show technical details or stack traces to the user.

---

## 14. CONTENT SAFETY BOUNDARY

The product is for everyday social situations and entertainment.

- Every excuse in the library is written in advance and reviewed, so output is safe by design.
- The library must not contain excuses involving fraud, impersonation, evading law enforcement, lying about medical emergencies or deaths of real people, harming anyone, or anything illegal or dangerous.
- A small **safety keyword list** (both languages) detects clearly unsafe situations (e.g. fraud, police, weapons, self-harm). When matched, the plaque shows a gentle, non-joking decline instead of an excuse.
- Prefer specific phrases (e.g. 「呃保險」, "lie to the police") over single broad words, so ordinary situations (e.g. a friend who is a police officer) are not blocked by mistake.
- Do not make the safety response humorous when doing so would trivialize serious harm.

---

## 15. APPLICATION STATES

1. Idle / empty input
2. Input entered
3. Validation message (empty or too long)
4. Immortal appears
5. Thinking
6. Plaque retrieval and reveal
7. Result displayed
8. Regenerating
9. Error + retry
10. Copy confirmation
11. Sharing

Manage state in one small, clear JavaScript module (e.g. a single `state` object and a `setState()` function that updates `data-state` on the page). The user should always understand what is happening.

---

## 16. EXCUSE ENGINE (runs in the browser)

### 16.1 Interface

One module, `docs/js/engine.js`, exposes one function:

```
generateExcuse({ situation, style, uiLang, previous })
  → { excuse, lang, category, refused, exhausted }
```

- `situation`: string, 1–300 characters after trimming
- `style`: `"polite"` | `"funny"` | `"ridiculous"`
- `uiLang`: `"zh-HK"` | `"en"` (used only when the input language is unclear)
- `previous`: excuses already shown for this situation in this session
- `lang`: the detected output language
- `category`: the matched category id (useful for debugging)
- `refused`: `true` when the safety list matched and `excuse` is a gentle decline
- `exhausted`: `true` when the pool ran out and was reshuffled

Keep this interface stable. It keeps the UI independent of how excuses are produced, so a future AI option (Section 27) could replace the engine without touching the UI.

### 16.2 Steps

1. **Validate** input (empty / too long → validation state, handled by the UI before calling the engine).
2. **Safety check** against the safety keyword list. Match → return a decline with `refused: true`.
3. **Detect language** (Section 6.2).
4. **Match category:**
   - Normalize the input: lowercase, trim, collapse spaces, convert full-width letters to half-width.
   - For each category, count keyword hits (substring matching, which works for Chinese without word segmentation).
   - Pick the category with the highest score. Ties → the category listed first. No hits → `general`.
5. **Pick an excuse** at random from `excuses[lang][category][style]`, excluding anything in `previous`. If none are left, set `exhausted: true` and pick from the full pool again.
6. **Return** the result.

The engine is pure logic with no DOM access, so it is easy to test.

### 16.3 Test page

Provide a simple developer test page (e.g. `docs/dev/engine-test.html`, not linked from the main UI) that:

- runs a list of sample situations in both languages through the engine,
- shows the matched category for each, and
- flags categories/styles with too few excuses.

This lets the product creator check matching quality in the browser without any tools.

---

## 17. EXCUSE LIBRARY (JSON data)

### 17.1 Files

```
docs/data/
├── categories.json        ← category ids + keywords (all languages) + safety keywords
└── excuses/
    ├── zh-HK.json         ← Cantonese excuses
    └── en.json            ← English excuses
```

### 17.2 Format

`categories.json`:

```json
{
  "version": 1,
  "categories": [
    {
      "id": "social_meal",
      "keywords": ["生日", "飯局", "食飯", "聚會", "party", "birthday", "dinner", "gathering"]
    }
  ],
  "safety": ["呃保險", "呃人錢", "點樣呃警察", "偽造文件", "insurance fraud", "scam someone", "lie to the police", "fake a document"]
}
```

Keywords include **both languages** in one list, because mixed input (e.g. 「我唔想去 birthday party」) is common.

`safety` entries must be **specific phrases**, never broad single words such as 「警察」 or "police" (see Section 14), so that ordinary situations like 「我朋友係警察」 are not blocked.

`excuses/zh-HK.json` (same shape for `en.json`):

```json
{
  "version": 1,
  "lang": "zh-HK",
  "excuses": {
    "social_meal": {
      "polite": ["…", "…"],
      "funny": ["…", "…"],
      "ridiculous": ["…", "…"]
    },
    "general": { "polite": [], "funny": [], "ridiculous": [] }
  },
  "decline": ["…gentle decline for unsafe requests…"],
  "exhausted": ["仙人都諗到詞窮喇……再嚟過！"]
}
```

### 17.3 MVP categories

Start with about 10 categories plus `general`:

| id | Examples |
|---|---|
| `social_meal` | birthday dinner, party, gathering |
| `date` | cancelling or avoiding a date |
| `work` | overtime, meetings, boss, colleagues |
| `reply_message` | not replying, read receipts, group chats |
| `borrow_lend` | lending money, car, things |
| `family` | relatives, family dinners, parents' requests |
| `favor` | helping move house, favors, errands |
| `late` | being late, missing an appointment |
| `study` | homework, deadlines, class |
| `exercise` | gym, hiking, sports invitations |
| `general` | fallback that fits almost any situation |

The product creator can add or rename categories later; the engine must not hard-code category names.

### 17.4 Content size

- **MVP minimum:** 5 excuses per category × style × language (about 330 excuses in total).
- **Launch target:** 10+ per category × style × language, expanded during Phase 12.

### 17.5 Writing guidelines

**Hong Kong Cantonese:** contemporary, natural written Cantonese in Traditional Chinese, like something a Hongkonger would actually type in WhatsApp.

Avoid:

- Mainland or Taiwanese phrasing
- Overly formal written Chinese
- Stiff "translated" Cantonese
- Outdated slang
- Forced trendy slang

**English:** natural and conversational, like a real text message. Written independently, not translated.

Avoid:

- Robotic wording
- Business formality
- Literal translation from Chinese
- Over-explaining

**Both languages:**

- Each excuse must stand alone. It should work for most situations in its category without naming specific people, dates, or places.
- Excuses within the same category/style should use **different ideas**, not reworded versions of the same idea.
- The three styles must feel clearly different.
- Nothing mean-spirited, discriminatory, or unsafe (Section 14).

**Workflow:** Claude Code drafts excuses in batches (one category at a time). The product creator reviews and edits them, especially the Cantonese, before they count as done.

---

## 18. REPOSITORY STRUCTURE (suggested)

```
<account>.github.io/         ← repository (name must match the account)
├── docs/                    ← the website (GitHub Pages publishes from /docs)
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── main.js          ← wiring & events
│   │   ├── state.js         ← app state
│   │   ├── i18n.js          ← UI localization helper
│   │   ├── engine.js        ← excuse engine (no DOM)
│   │   ├── animation.js     ← immortal & plaque sequence
│   │   └── share.js         ← copy, share card, share
│   ├── locales/
│   │   ├── zh-HK.json       ← UI strings
│   │   └── en.json
│   ├── data/
│   │   ├── categories.json
│   │   └── excuses/
│   │       ├── zh-HK.json
│   │       └── en.json
│   ├── dev/
│   │   └── engine-test.html ← developer test page
│   └── assets/              ← SVG/WebP art, icons, OG image
├── spec/
│   ├── MASTER_PROMPT.md     ← this full specification (read sections on demand)
│   └── reference/
│       └── immortal-reference.png  ← character reference image (needed by Phase 11)
├── .gitignore
├── README.md
├── CLAUDE.md                ← short rules, auto-loaded by Claude Code every session
└── PROGRESS.md              ← current phase, done, next step, decisions
```

Explain to the product creator that `docs/` here means "the website folder", not documentation. This is a GitHub Pages convention.

**Never put project notes, the spec, or anything private inside `docs/`.** Everything in `docs/` is published as part of the website. (The repository itself is public too, so nothing private belongs anywhere in it.)

Keep files small and focused. Do not over-engineer.

---

## 19. LOCALIZATION ARCHITECTURE

- All user-facing UI text lives in `docs/locales/*.json`. **No hard-coded Chinese or English strings in HTML or JS.**
- Excuse content lives separately in `docs/data/excuses/*.json`.
- A small `i18n.js` with a `t(key)` function, plus `data-i18n` attributes on HTML elements.
- Cover:
  - UI, buttons, placeholders
  - empty states, thinking messages, and errors
  - copy confirmation
  - style names
  - share-card text
  - `aria-label`s
  - page title and meta description
- Adding a third language later should mean adding one UI JSON file and one excuse JSON file.
- English strings are written natively, not translated word-for-word.

---

## 20. LOCAL DEVELOPMENT

- ES modules and `fetch()` of JSON files do not work from `file://`. Serve the site locally with a simple static server. Prefer one that needs no installs on Windows (e.g. the Cursor "Live Server" extension) and explain it.
- For phone testing, simply push to GitHub and test the live GitHub Pages URL (updates usually appear within a minute or two).

---

## 21. DATA & PRIVACY

- No accounts, no server, no database, no analytics, no tracking cookies.
- The user's situation is processed **only in their browser** and is never sent anywhere.
- `localStorage` only for small conveniences (e.g. language preference).
- Add a short localized privacy note (e.g. in the footer), such as: 「你輸入嘅內容只會喺你部機處理，唔會傳送去任何地方。」 / "What you type stays on your device. Nothing is sent anywhere."

---

## 22. GIT & GITHUB

- The repository must be **public** for free GitHub Pages. Never put secrets, passwords, or private notes in it.
- Commit every time a small step is **working** (e.g. "language toggle works"), so there is always a recent safe point to return to. Never commit a broken state.
- Use clear messages, e.g.:
  - `Initial project structure`
  - `Build home screen`
  - `Add localization`
  - `Add immortal animation`
  - `Add plaque reveal`
  - `Add excuse library: social_meal`
  - `Add excuse engine`
  - `Add copy, regenerate and share`
  - `Complete MVP`
- If a change breaks the app, use Git history to return to the last working state rather than piling on more edits.

---

## 23. DEVELOPMENT PHASES

**Phase 1 — Environment check**

Verify on Windows:

- Git installed and configured (name / email)
- GitHub account and final account name (this decides the URL)
- Cursor
- Claude Code (confirm it launches successfully and can access the project directory)
- Chrome
- A way to run a local static server

**Phase 2 — Project setup & first deployment**

- Create the repository `<account>.github.io` and the folder structure
- Add `.gitignore`, `README.md`, `CLAUDE.md`, `PROGRESS.md`, `spec/MASTER_PROMPT.md`
- Add a "Hello, Immortal" `docs/index.html`
- Push to GitHub
- Enable GitHub Pages (from the `/docs` folder of the main branch)
- Confirm `https://<account>.github.io` loads on a phone

Deploying on day one proves the pipeline works.

**Phase 3 — Home screen + localization**

- Layout
- Situation input and style selector
- Submit button
- Language toggle
- UI i18n system with zh-HK and en
- Empty-input and length validation

**Phase 4 — Immortal**

- Layered SVG placeholder immortal
- Appear and thinking states
- A temporary hard-coded sample excuse so the flow can be tested

**Phase 5 — Plaque**

- Plaque placeholder
- Retrieval, move to center, horizontal flip, reveal
- Tap to skip
- Reduced-motion version

**Phase 6 — Excuse library structure + first content**

- Create `categories.json` and the two excuse files in the format of Section 17
- Fill 2–3 categories completely (both languages, all styles, 5 each) plus `general`
- Product creator reviews the content

**Phase 7 — Excuse engine**

- `engine.js` following Section 16
- Safety check, language detection, category matching, no-repeat picking
- `dev/engine-test.html`

**Phase 8 — Connect engine to the reveal**

- Replace the temporary sample excuse with the engine
- Show real results on the plaque in the right language

**Phase 9 — User actions**

- Copy
- Generate Another (no repeats, "out of ideas" message)
- Share card + Web Share API + fallbacks

**Phase 10 — Thinking messages & errors**

- Rotating localized thinking messages
- Every error case in Section 13.8, with retry

**Phase 11 — Final visual assets**

- Prerequisite: `spec/reference/immortal-reference.png` is in the repo (Section 10)
- Final immortal, koi, plaque, background, icons
- OG preview image
- Keep total size within budget

**Phase 12 — Content & localization review**

- Complete all MVP categories (minimum 5 per category/style/language), then expand toward the launch target
- Verify every Chinese and English string
- Check layouts with long English text

**Phase 13 — Cross-browser & device testing**

- Chrome DevTools device mode
- Real Android Chrome
- Real iPhone Safari
- In-app browsers (WhatsApp, Instagram)
- Desktop

**Phase 14 — Launch**

- Final deploy
- Manifest / Add to Home Screen check
- Link-preview check in messaging apps

**Phase 15 — Polish**

Animation, typography, spacing, immortal expressions, plaque look, thinking messages, share card, and performance.

Polish only after the core experience works.

---

## 24. TESTING CHECKLIST

**Languages:** Chinese input, Cantonese input, English input, mixed input, emoji-only input

**Input:** empty, very short, long / at limit, emoji, many different social situations

**Styles:** 😇 Polite, 😂 Funny, 💀 Ridiculous. Each should feel clearly different.

**Excuse engine:**

- correct category for common situations in both languages
- sensible `general` fallback for unmatched situations
- correct output language
- safety list triggers the decline
- Generate Another never repeats until the pool runs out
- "out of ideas" message, then reshuffle

**Features:**

- copy (including in-app browsers)
- share with image
- share fallback
- animations
- tap to skip
- reduced motion
- thinking messages
- data-load failure and retry

**Browsers / devices:**

- Android Chrome
- iOS Safari (a real iPhone can test the site directly; no Mac or Xcode is needed)
- Samsung Internet
- in-app browsers
- desktop Chrome / Edge / Safari / Firefox

**Layout:**

- small phones (360 px)
- large phones
- tablets
- desktop
- landscape
- long Chinese text
- long English text

**Privacy:** the browser Network tab shows no request containing the user's text.

---

## 25. BEGINNER-FRIENDLY WORKING RULES

For every major stage:

1. Inspect the current project.
2. Understand what already exists.
3. Explain the plan (in Traditional Chinese).
4. Before making a major change, list the files that will be changed and explain why each file needs to change.
5. Make only the changes needed for this stage.
6. Run checks (open the page, check the browser console for errors).
7. Fix errors.
8. Explain what changed, in plain language, including the files changed.
9. Explain exactly how the product creator can test it, step by step.
10. Update `PROGRESS.md` (done / next / decisions) and propose a commit.
11. **Wait for confirmation before the next major stage.**

### Working efficiently (Claude Pro usage limits)

- At the start of a session, read `CLAUDE.md` and `PROGRESS.md` first. Read only the spec sections relevant to the current task, not the whole spec.
- Use plan mode at the start of each phase so the plan is reviewed before code is written.
- Edit files with small targeted changes; do not rewrite whole files.
- When writing excuse content, work one category at a time.
- After a phase is committed, the product creator may run `/clear`; `PROGRESS.md` must contain everything needed to continue.
- When the product creator reports a bug, ask for (if not given): the browser console error, a screenshot, and "what I did / what I expected / what happened".

---

## 26. STRICT RULES FOR CLAUDE CODE

1. **Static & free.** No backend, server, database, serverless function, paid API, or runtime AI call. Everything must run on free GitHub Pages.
2. **MVP first.** Do not implement future features unless explicitly requested.
3. **Inspect before modifying.**
4. **Small steps.** No huge uncontrolled changes.
5. **Preserve working code.** No unnecessary rewrites or unrelated refactoring.
6. **Explain changes** in beginner-friendly Traditional Chinese.
7. **Test** each stage before moving on.
8. **Ask before major decisions**, especially anything irreversible or account-related.
9. **Keep it simple.** Plain HTML/CSS/JS; no framework or build step without approval.
10. **Public repo.** Never put secrets or private information anywhere in the repository.
11. **The immortal is core**, not decoration.
12. **Mobile-first web.** It must work well in phone browsers and in-app browsers.
13. **English is first-class**, independently and naturally written.
14. **Experience over complexity.** The goal is a memorable, funny, polished experience.
15. **Performance matters.** Shared links must open fast.
16. **No silent architecture or dependency changes.** Explain the reason, what it does, and its cost/maintenance impact, and get approval first.
17. **No unnecessary file churn.** Keep unrelated files untouched and avoid rewriting whole files when a small change is sufficient.
18. **Content is data.** Excuses live only in the JSON library, never hard-coded in JS or HTML.

---

## 27. FUTURE FEATURES (do NOT build unless asked)

- Optional AI-generated excuses via a serverless proxy. This would add running costs and a backend, so it needs an explicit decision. The engine interface (Section 16.1) is designed so it could be swapped in.
- Recipient awareness (boss, friend, partner, parent) to adjust tone
- Additional immortals with different personalities
- More plaque designs (materials, themes, festival editions)
- History and favorites (local only)
- More share templates (WhatsApp, IG Story, Threads)
- More styles: 敷衍, 可憐, 高EQ, 冷淡, 社死, 超級荒謬
- Credibility slider (Believable ←→ Ridiculous)
- More social tools: refusal, apology, cancellation, rescheduling, reply helper, awkward-conversation helper
- Offline support / full PWA with a service worker
- Custom domain

---

## 28. MVP SUCCESS CRITERIA

The MVP succeeds when a user can:

1. Tap a `https://<account>.github.io` link and open the site on any modern phone browser, with nothing to download.
2. Use it in Chinese or English.
3. Describe a real or imaginary situation.
4. Choose 😇 禮貌 / Polite, 😂 搞笑 / Funny, or 💀 離譜 / Ridiculous.
5. Ask the immortal.
6. See the immortal appear and think.
7. See him retrieve the plaque.
8. See the plaque flip and reveal a fitting excuse.
9. Read a natural excuse in the right language.
10. Copy it.
11. Get a different one with Generate Another.
12. Share it as an image card or a link.

And the whole thing costs **nothing** to run.

Most importantly, the user should feel:
「哈哈，呢個幾好玩喎。」

**Situation → Immortal → Plaque → Excuse → Laugh → Copy / Share / Generate Another**
