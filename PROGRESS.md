# PROGRESS — 藉口生成器 / Excuse Me

Claude Code: read this at the start of every session and update it at the end of every step.
Keep it short: replace old "Next step" text rather than appending forever.

## Current phase

**Phase 5 — Plaque** (not started)

## Next step

Plan Phase 5 (spec Section 12): plaque from the `#sleeve` layer, `#plaque` placeholder group already exists in `assets/immortal.svg`; replaces the plain result card.

## Phase checklist

- [x] 1. Environment check
- [x] 2. Project setup & first deployment (Hello page live on GitHub Pages)
- [x] 3. Home screen + localization
- [x] 4. Immortal (placeholder SVG, appear/thinking, sample excuse)
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
- Branching: work directly on `main`. After each phase is committed, push to `main` so the live site updates (creator chose this over a `dev` branch).
- Reference image stays local only: `spec/reference/immortal-reference.jpeg` is ignored via `.gitignore` (whole `spec/reference/` folder) and never committed. This overrides the spec's "in the repo" wording. Use it for Phase 11 from the local folder.
- Input limit is **100 characters** (counter appears from 50). Overrides the spec's ~300 (Section 13.2).
- Submit button label: 「問大仙」 / "Ask the Immortal". Home prompt: 「到底發生過什麼事」 / "Hey yo what’s up" (creator's wording). English label for the 💀 style is "Insane" (internal id stays `ridiculous`).
- Scene (creator's request): home already shows a floating cloud, starlight beams + falling sparkles from the top, and two koi circling the cloud (passing in front of and behind it). This overrides the spec's "no complex koi animation"; it is CSS-only (transform/opacity, plus a discrete z-index switch).
- Asking: home fades out, the immortal pops up from behind the cloud with a puff. Skip = round arrow button bottom-right during the performance.
- Result screen has a permanent 「← 改過個情況」 / "← Change the story" button that returns home with the text kept.
- Temporary sample excuse lives in locales (`sample.excuse`); remove it in Phase 8.

## Open questions

(none)

## Known issues

(none yet)
