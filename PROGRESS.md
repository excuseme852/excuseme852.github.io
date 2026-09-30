# PROGRESS — 藉口生成器 / Excuse Me

Claude Code: read this at the start of every session and update it at the end of every step.
Keep it short: replace old "Next step" text rather than appending forever.

## Current phase

**Phase 2 — Project setup & first deployment** (in progress)

Done locally: `git init` (main), `.gitignore`, `README.md`, `docs/index.html` (Hello, Immortal), `docs/.nojekyll`, first commit.

## Next step

Product creator: create public repo `excuseme852.github.io` on GitHub (no README), push `main`, enable Pages (Deploy from branch → `main` / `/docs`), then confirm `https://excuseme852.github.io` loads on a phone.

## Phase checklist

- [x] 1. Environment check
- [ ] 2. Project setup & first deployment (Hello page live on GitHub Pages)
- [ ] 3. Home screen + localization
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
- Commit email: GitHub noreply address (personal email stays private).
- Reference image stays local only: `spec/reference/immortal-reference.jpeg` is ignored via `.gitignore` (whole `spec/reference/` folder) and never committed. This overrides the spec's "in the repo" wording. Use it for Phase 11 from the local folder.

## Open questions

(none)

## Known issues

(none yet)
