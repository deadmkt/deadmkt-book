# deadmkt-book

Documentation site for the deadmkt protocol.

## Structure

- `docs/` — VitePress source (markdown). Edit these files.
- `docs/public/` — Static assets copied into the VitePress build as-is (incl. `notebook-source.md`, served raw).
- `docs/playbook.md` — Universal operator playbook (AI-paste page). Short URL `deadmkt.com/playbook` 301-redirects to `/docs/playbook`.
- `public/` — Hand-coded root pages (landing, trades dashboard, account, `DEADMKT_SKILL.md`).
- `public/docs/` — LEGACY docsify tree; NOT shipped by `build.mjs` (candidate for deletion).
- `build.mjs` — assembles `dist/` = VitePress output under `/docs` + the `public/` root pages. Cloudflare Pages runs it on push.

## Run

```bash
npm install
npx vitepress dev docs     # docs hot-reload
npm run build              # full production build -> dist/
npx serve dist             # preview the assembled site
```

## Deploy

Branching: feature branches (e.g. `dmkt14/*`) → `develop` → PR to `staging` → PR to `main`. Cloudflare Pages builds on push. Keep contract addresses + protocol facts aligned with the LIVE deployment (see `planning/current/STATUS.md` in the planning repo).

## Rules

- Edit in `docs/`, never in build output (`dist/`, `docs/.vitepress/dist/`)
- No non-ASCII characters in content files
- `DEADMKT_SKILL.md` is machine-read by AI assistants — its contract address MUST track the live deployment
