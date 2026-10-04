# PROGRESS — 藉口生成器 / Excuse Me

Claude Code: read this at the start of every session and update it at the end of every step.
Keep it short: replace old "Next step" text rather than appending forever.

## Current phase

**Phase 9 — Copy / Generate Another / Share** (built and tested locally; waiting for creator review and commit)

## Next step

The creator tests Phase 9 on a phone, then commits and pushes. After that, plan Phase 10 (thinking messages and errors).

What Phase 9 added:
- Three buttons under the plaque: 📋 Copy, 🔄 Another, 📤 Share.
- **Copy** uses the clipboard API, with an `execCommand` fallback. If both fail, it selects the plaque text and shows a toast.
- **Another** gives a short flip-back/flip-forward (the `regenerating` state) with no repeats.
- **Out of ideas**: when the pool reshuffles, the immortal says the `exhaustedLine` in a speech bubble for about 3 s.
- **Share** draws a 1080×1350 PNG card in `docs/js/share.js` (brand, tagline, wooden plaque with the excuse, immortal on a cloud, site URL).
  - The card is drawn as soon as the plaque is revealed, so sharing stays inside the tap.
  - Web Share is used when the browser can share files. Otherwise the image is downloaded and the text plus link is copied.
- Refusal and crisis screens show no action buttons, only "back".
- Fixes from creator testing:
  - With a mouse on a computer, the wheel and click-drag now scroll the topic row (`enableMouseScroll` in `topics.js`).
  - More crisis triggers: "kill myself", "end it all", 殺死自己, 了結自己 and others. Typing "dont" without the apostrophe also matches.
  - Engine tests: 323/323.

## Phase checklist

- [x] 1. Environment check
- [x] 2. Project setup & first deployment (Hello page live on GitHub Pages)
- [x] 3. Home screen + localization
- [x] 4. Immortal (placeholder SVG, appear/thinking, sample excuse)
- [x] 5. Plaque (retrieve, move, flip, reveal, tap to skip, reduced motion)
- [x] 6. Excuse library structure + first content
- [x] 7. Excuse engine + dev test page
- [x] 8. Connect engine to the reveal
- [x] 9. Copy / Generate Another / Share (pending commit)
- [ ] 10. Thinking messages & errors
- [ ] 11. Final visual assets
- [ ] 12. Content & localization review (complete library)
- [ ] 13. Cross-browser & device testing
- [ ] 14. Launch
- [ ] 15. Polish

## Decisions made

- Static web app on free GitHub Pages. No backend, no paid API, no runtime AI. Zero running cost.
- Excuses come from a pre-written JSON library + in-browser engine (spec Sections 16–17).
- URL format: GitHub user site `https://<account>.github.io`; repository must be named `<account>.github.io` and be public.
- Plain HTML/CSS/JS, no build step; website served from `docs/`.
- GitHub username `excuseme852` → repo `excuseme852.github.io` → `https://excuseme852.github.io`. Local folder name (`ExcuseMe.github.io`) does not matter.
- Environment: Git 2.56 (default branch `main`), Cursor + Live Server, Chrome, Claude Code.
- Deployed: remote `origin` = github.com/excuseme852/excuseme852.github.io; Pages serves `main` / `/docs`; live and verified on a phone.
- Commit email: GitHub noreply address (personal email stays private).
- Branching: work directly on `main`. After each phase is committed, push to `main` so the live site updates (creator chose this over a `dev` branch).
- Reference image stays local only: `spec/reference/immortal-reference.jpeg` is ignored via `.gitignore` (whole `spec/reference/` folder) and never committed. This overrides the spec's "in the repo" wording. Use it for Phase 11 from the local folder.
- Input limit is **100 characters** (counter appears from 50). Overrides the spec's ~300 (Section 13.2).
- Submit button label: 「問大仙」 / "Ask the Immortal". Home prompt: 「到底發生過什麼事」 / "Hey yo what’s up" (creator's wording). English label for the 💀 style is "Insane" (internal id stays `ridiculous`).
- Scene (creator's request): home already shows a floating cloud, starlight beams + falling sparkles from the top, and three koi circling the cloud (passing in front of and behind it) at randomly changing speeds. This overrides the spec's "no complex koi animation"; the orbit is CSS (transform/opacity, plus a discrete z-index switch) and `startKoiSwimming()` in `animation.js` only varies playbackRate.
- Asking: home fades out, the immortal pops up from behind the cloud with a puff. Skip = round arrow button bottom-right during the performance.
- Result screen has a permanent 「← 改過個情況」 / "← Change the story" button that returns home with the text kept.
- Temporary sample excuse lives in locales (`sample.excuse`); remove it in Phase 8.
- Plaque: wooden (light-wood front with engraved text, darker back with gold cloud medallion). Font: system 楷書 stack (Kaiti TC / STKaiti / BiauKai / DFKai-SB / KaiTi), Georgia for English; no web font download.
- Sequence timing (full motion): appear 0.6s → think 1.5–2.0s → react + raise left arm beside head 0.5s → plaque slides out of the raised sleeve 0.8s → fly to centre 0.45s → flip 0.5s ≈ 4.35–4.85s. Creator asked for a slower, clearer retrieval, accepting a bit over the spec's ~4s (skip arrow is always available). The flight uses the Web Animations API (start point depends on screen size); everything else is CSS driven by `data-state`.
- `state.js` also sets `body[data-scene="home|stage"]` so CSS doesn't list every stage state.
- Phase 6 content: first categories `social_meal`, `work`, `late` + `general`; reviewed in chat as tables, one category at a time. `categories.json` lists all 10 categories' keywords now; categories without excuses fall back to `general` (Phase 7 engine must do this).
- 💀 style may use gallows humour aimed at the situation or oneself (soul leaving body, spiritually resigned, doom). Never suicide/self-harm, real deaths/serious illness, or mocking groups.
- Keywords: creator's own list (11 categories incl. new `health`) plus creator's 5 matching rules, written in `categories.json` → `matching`. Format extends spec 17.2 with optional per-category fields: `weakKeywords` (1 point vs 2), `exclude` (phrases removed from the input before scoring that category, e.g. "due date" for `date`, "running late" for `exercise`), `yieldsTo` (`health` steps aside when `work` also scores). Winner: highest score → longer matched keywords → list order → `general` if zero. The engine must not hard-code category names; all of this comes from the JSON. Prototype check (2026-10-01): 15/15 sample sentences land correctly after adding "late for" to `late`.
- Phase 7 engine: lowercase both input and keywords (list has "Tinder", "OT", "唱K"). English keywords must match whole words (not next to other Latin letters), so "ot" doesn't hit "not" and "late" doesn't hit "chocolate". Chinese keywords use plain substring matching.
- Safety (creator's 11 safety categories + 7 rules): `categories.json` → `safety` is an object, not a flat list. Keywords are signals, context decides (no AI possible in a static site, so context = rules). Per category `strong` / `weak` signals; global `intentCues`, `discussionCues`, `negationCues`, `victimCues`. Order: negation cue within 15 chars before → ignore; victim cue within 15 chars before (or "me" within 15 after) → victim message; strong → refuse; weak → refuse only with an intent cue and no discussion cue. Rules are written in `safety.rules`. Prototype passed 26/26 sample sentences (10 refuse, 12 harmless incl. 熱到殺人 / life hack / panic attack / bombed my exam, 4 victim); port these to the Phase 7 test page.
- Victim message (approved): excuse files → `victim` (call 999 / someone you trust). Refusal + victim messages are always serious, never 😂/💀.
- Crisis support (creator's spec, 2026-10-02; extends spec): `categories.json` → `support` object with `rules`, category `crisis_support` (`triggers` + `exclude` e.g. 唔想活動), `excludedStandalone` (想死 / want to die never trigger alone), `urgentCues`. Priority: crisis check → safety check → category matching. Messages in excuse files: `support` (香港撒瑪利亞會 / The Samaritans 2896 0000 + 生命熱線 / Suicide Prevention Services 2382 0000, both verified 24h) and `supportUrgent` (999 first) when an urgent cue is present. Never an excuse, joke or refusal message. "hurt myself" narrowed to "hurting myself" / "want to hurt myself" / "hurt myself on purpose" so sports injuries don't trigger. Prototype passed 14/14 (incl. 攰到想死, 唔想活動筋骨, I hurt myself playing football → normal).
- `exhausted` sentences approved; the creator may add more anytime (just add lines to the array).
- Content principle (creator, fixed): within a category, every excuse must be a different *idea*, not reworded text. E.g. `social_meal` covers prior plans / work / family / helping a friend / rest / money / early start / time. Aim for 8 per style (above the MVP 5). 💀 should be "absurd with a clear picture", not random; deadpan and absurd, and not every line needs to be dark.
- 😇 polite lines should read like a real WhatsApp message, not a polished, fully written-out excuse (creator's late-category edits).
- Quality anchors (creator's favourites, use as the tone reference for new categories): 😇 「唔好意思呀，嗰日我早已經約咗人，真係走唔開，下次我再約你！」 😂 「我個社交電量淨返 3%，再出街可能會直接自動關機。」 💀 「我同我嘅拖延症簽咗合約，佢話我一出門就算違約，我賠唔起呀。」
- Engine (`docs/js/engine.js`): `loadLibrary()` + `generateExcuse({ situation, style, uiLang, previous })` → `{ excuse, lang, category, refused, exhausted, kind }`. `kind` (approved addition) = excuse | refused | victim | support | supportUrgent; `refused` is true whenever no excuse is given. `category` is the *matched* category even when excuses come from `general` because that category has none yet. `analyze()` explains a decision without picking (used by the test page).
- Dev test page `docs/dev/engine-test.html` (public but noindex, English-only dev tool, not linked from the app). Test sentences live in `docs/dev/engine-test-cases.json`; the creator can add cases there. 163/163 passing on 2026-10-03.
- Real-world batch 1 (100 unseen sentences, 2026-10-03): first run 61/100. Fixes approved by creator: crisis trigger "don't want to go on" → "…go on living / …go on anymore" (it matched "go on a date"), plus excludes for "don't want to live with/in/here/there"; new support triggers (生存冇意義, 唔想再撐…); victimPhrases + "Chinese signal followed by 我" = victim; safety categories may have `exclude` (e.g. "threatened to fire me" is not extortion); more fraud/hit-and-run/account-intrusion signals; engine accepts English endings (-s/-es/-ed/-d/-ing, doubled last letter) and ignores spaces next to Chinese characters; who/where words (同事, coworker, class, mum, mom, dad, cousin, 公司) are weak keywords; `health` yieldsTo `late` too; many keywords added (老細, 頂更, 同學會, 拜年, whatsapp, meeting, assignment, flu…). Expectation changed for one case: "my cousin's wedding" → social_meal (event beats person). Note: batch 1 now passes because rules were tuned on it; a fresh unseen batch is the honest accuracy check.
- Real-world batch 2 (100 unseen, 2026-10-03): first run 32/100 on-topic. Of the 68 misses: 52 fell back to `general` (still a usable excuse), 8 wrong category, 8 serious (safety/victim/crisis). Honest conclusion: keyword matching tops out around 60–75% on-topic; true understanding would need AI (spec Section 27, future, costs money). Serious 8 fixed and approved (想消失 / want to disappear → support; 對我毛手毛腳, "at my work uninvited" → victim; 假收據, 偷改成績, punched my, 散播佢嘅私人相, "messages without her knowing" → refuse), each with a guard sentence so it doesn't over-trigger. Batch 2 added to the test file (categories part 28/88 until keyword expansion). Next: creator reviews proposed keyword expansion (~40–50 per category).
- **Topic buttons (creator, 2026-10-03; overrides spec 13.1 "no forced predefined situations")**: same home screen, optional topic buttons. While the user types, the engine's guess lights up a button; the user can tap another to correct it; a picked topic wins (`generateExcuse({ …, category })`). Text may become optional when a topic is picked. Show only topics with written excuses: 聚會 social_meal, 返工 work, 遲到 late, 其他 general; add a button whenever a new category is written. Crisis + safety checks always run on the text, whatever the topic. Build in Phase 8. Labels go in locale files.
- Keyword big expansion (approved 2026-10-03): ~20–50 keywords per category incl. synonyms, HK slang, mixed zh/en. 屋企 removed (屋企人 strong, 返屋企 weak); family person words weak; deadline/colleague(s) weak; `study` yieldsTo `late`; `date` excludes ex-boss/ex-colleague…; engine no longer double-counts a keyword inside a longer matched keyword. Fresh 15-sentence probe after expansion: 11/15 on-topic; known misses kept on purpose (take care of my mum → favor, "cash only restaurant" → borrow, 陪佢去睇醫生 → health) because topic buttons let users correct, and further tuning just overfits.
- Phase 8 build (2026-10-04): `js/topics.js` = topic buttons (order = `topic` labels in the locale file; a button needs excuses in every style + language AND a label) + the home-screen **peek** (creator's idea): with nothing typed/picked, the immortal's head (top of head + eyes only, staff and right hand hidden) rises over the cloud with a thought bubble showing the next topic ("🍻 聚會？") — first after 3 s, then up 4 s / hidden 3 s (creator's timing); after typing (and when the input loses focus, i.e. the phone keyboard closes) he peeks with his guess ("💼 返工？") and **stays up** until the user asks, picks a topic, or types again; picking → "💼 返工！" for 4 s; un-picking → back to his guess. Topic legend is just 「主題」 / "Topic". Bubble is a hint only (not clickable; topic buttons do the picking). To make room, the home screen **sinks the cloud** (CSS `translate: 0 var(--cloud-sink)`, set by `fitCloud()` in topics.js) just enough for 75 px above it (bob excluded), up to 70% of its height; it rises back when the show starts. No peek when the tab is hidden, under reduced motion, or when even the sunken cloud leaves no room (e.g. 360×640). Home content is top-aligned; screens ≤800 px tall get a tighter layout. Thought bubble sits beside his head just over the cloud edge. Bug fixed 2026-10-04: the room check used the live (bobbing) gap and rounded the sink down, so peeks failed on most phones/laptops after the first. Verified: 390×844 (no sink), 390×760 (53 px), 1280×720, 1366×657 (125 px) peek; 360×640 doesn't.
- Safety `combos` (2026-10-04): a combo matches when every word appears anywhere (偷 … 錢, "i stole" … money, "i took" … without asking); counts as strong; context checked around the first word. English combos need "I" as subject so "My sister took my phone without asking" stays an excuse. Theft `exclude` keeps 小偷 (listed first — order matters), 偷懶, 偷食, 偷睇, 偷笑, 偷偷… safe. Victim rule widened: 我 within 2 chars after a Chinese signal (偷咗我). Combos are **ordered** (so "my mom will kill me" ≠ "I kill my mom"), a part may be a list ("any of"), and `{ within, parts }` caps the gap between parts. Violence combos added (kill/murder/stab/poison/strangle … my mom/him/…; 殺/毒死 … 阿媽/佢/… within 6) after the creator found "I kill my mom" unrefused; 劏/斬/仔/女 left out (劏雞, 斬叉燒). Known trade-off: joking hyperbole like "I'm going to kill my brother for eating my snacks" is refused. 304/304 tests.
- Result tones (approved 1A/2A): `normal` excuse = full show + glow; `serious` refusal (made more obvious at the creator's request, 2026-10-04) = **grey stone plaque**, red label 「⚠️ 大仙唔幫呢個忙」, he **shakes his head "no" left–right** (head ±7 px, eyes swing a little further so it reads as turning; 0.7 s) instead of hopping, thinking shortened to 0.9 s, no glow; `calm` crisis/victim = no show, immortal stays hidden, message fades in, phone numbers are tap-to-call links. Thinking bubble shows the topic ("💼 返工……🤔"). Excuses don't repeat within a session per lang|category|style until all are used. Library loads in the background after first render; if it fails, a simple 「天書暫時打唔開」 message (full retry UI in Phase 10).
- **Sub-situation tags (2026-10-04, after "朋友叫我幫手搬屋" got a pick-up excuse)**: an excuse may be `{ "text", "tags" }`; the engine (`fittingExcuses`) offers tagged lines only when the input mentions a tag, plus all plain (general) lines; only-topic/vague input gets general lines only. Content rule from now on: write most lines general for the whole category; tag lines that only fit one sub-situation (moving, pick-up, pets, OT, meetings, money vs things…). Each category/style needs ≥3 general lines (test page coverage flags fewer); **creator's target (2026-10-04): ≥10 general lines per category, style and language**, topped up in review batches. Gaps at tagging time: work polite 0, work 💀 zh 2, borrow_lend 0 in all styles, favor 😂 2.
- `health` excuses must stay mild (tired, headache, not feeling well). No fake emergencies, hospital stays or serious illness (spec Section 14).
- Plaque text size steps down by length (`data-size`, limits in `main.js`); Phase 8 should size by the excuse's language and set `lang` on `#plaque-text`.

## Open questions

(none)

## Known issues

(none yet)
