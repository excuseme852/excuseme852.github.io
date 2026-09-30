# PROGRESS — 藉口生成器 / Excuse Me

Claude Code: read this at the start of every session and update it at the end of every step.
Keep it short: replace old "Next step" text rather than appending forever.

## Current phase

**Phase 4 — Immortal** (not started)

## Next step

Plan Phase 4 (spec Sections 10–11, 15): placeholder immortal SVG, appear + thinking states, sample excuse. Replaces the temporary 「大仙收到」 message (`home.tempReceived`).

## Phase checklist

- [x] 1. Environment check
- [x] 2. Project setup & first deployment (Hello page live on GitHub Pages)
- [x] 3. Home screen + localization
- [ ] 4. Immortal (placeholder SVG, appear/thinking, sample excuse)
- [ ] 5. Plaque (retrieve, move, flip, reveal, tap to skip, reduced motion)
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
- Branching: day-to-day work happens on `dev` and is pushed there as a backup (Pages ignores it). Merge `dev` into `main` only when the creator says it is ready to go public (~80% done). Phase 3 home screen is already live on `main`.
- Reference image stays local only: `spec/reference/immortal-reference.jpeg` is ignored via `.gitignore` (whole `spec/reference/` folder) and never committed. This overrides the spec's "in the repo" wording. Use it for Phase 11 from the local folder.
- Input limit is **100 characters** (counter appears from 50). Overrides the spec's ~300 (Section 13.2).
- Submit button label: 「問大仙」 / "Ask the Immortal". Home prompt: 「到底發生過什麼事」 / "Hey yo what’s up" (creator's wording). English label for the 💀 style is "Insane" (internal id stays `ridiculous`).
- Phase 3 submit shows a temporary localized message (`home.tempReceived`); remove it in Phase 4.

## Open questions

(none)

## Known issues

(none yet)
