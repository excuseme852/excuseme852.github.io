# PROGRESS — 藉口生成器 / Excuse Me

Claude Code: read this at the start of every session and update it at the end of every step.
Keep it short: replace old "Next step" text rather than appending forever.

## Current phase

**Phase 6 — Excuse library structure + first content** (in progress: step A done)

## Next step

Step A done (data files, keywords, safety/support/victim/decline/exhausted). Next: write `social_meal` (15 zh + 15 en), show as tables in chat, creator reviews, then save + commit. Then `work`, `late`, `general`. Push to `main` when all four are approved.

## Phase checklist

- [x] 1. Environment check
- [x] 2. Project setup & first deployment (Hello page live on GitHub Pages)
- [x] 3. Home screen + localization
- [x] 4. Immortal (placeholder SVG, appear/thinking, sample excuse)
- [x] 5. Plaque (retrieve, move, flip, reveal, tap to skip, reduced motion)
- [ ] 6. Excuse library structure + first content
- [ ] 7. Excuse engine + dev test page
- [ ] 8. Connect engine to the reveal
- [ ] 9. Copy / Generate Another / Share
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
- Content principle (creator, fixed): within a category, every excuse must be a different *idea*, not reworded text. E.g. `social_meal` covers prior plans / work / family / helping a friend / rest / money / early start / time. Aim for 8 per style (above the MVP 5). 💀 should be "absurd with a clear picture", not random.
- Quality anchors (creator's favourites, use as the tone reference for new categories): 😇 「唔好意思呀，嗰日我早已經約咗人，真係走唔開，下次我再約你！」 😂 「我個社交電量淨返 3%，再出街可能會直接自動關機。」 💀 「我同我嘅拖延症簽咗合約，佢話我一出門就算違約，我賠唔起呀。」
- `health` excuses must stay mild (tired, headache, not feeling well). No fake emergencies, hospital stays or serious illness (spec Section 14).
- Plaque text size steps down by length (`data-size`, limits in `main.js`); Phase 8 should size by the excuse's language and set `lang` on `#plaque-text`.

## Open questions

(none)

## Known issues

(none yet)
