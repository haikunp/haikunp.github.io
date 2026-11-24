# MiniAdda Dashboard

A local, combined admin panel for the MiniAdda site. One place to manage all three
content types and publish them to GitHub:

- **Prices** — live coin prices (CoinMarketCap/CoinGecko) for the `/prices` tool.
- **News & Articles** — one list/editor for both `kind: news` and `kind: article`
  stories (`src/content/articles/`). Add, edit, delete, and **rearrange** (drag or ▲▼)
  — the order is saved and drives the site order.
- **Sigcamp** — a row-by-row table editor (`src/data/sigcamp.yml`): Name, Manager,
  Payment, Link. Serial number follows row order; the site shows a Visit button.

Publishing commits the changed content to the GitHub repo via the GitHub API; GitHub
Actions then builds the Astro site and deploys it to GitHub Pages.

## Run

```bash
cd miniadda
python3 dashboard/run.py     # opens http://127.0.0.1:8787
```

Uses only the Python standard library (no pip installs).

## Token

Create `miniadda/.env` (gitignored):

```
MINIADDA_GITHUB_TOKEN=github_pat_xxx
```

Use a **fine-grained** PAT scoped to `haikunp/haikunp.github.io` with:
- **Contents: Read and write** (commit content)
- **Workflows: Read and write** (only if you ever commit workflow changes)

The token is never stored in the repo or in `dashboard/data/state.json` — only in
`.env`, which is gitignored. Check it from the dashboard header or the **Publish** tab.

## What each tab does

- **Prices**: live prices preview. The numbers baked into `/prices` pages are refreshed
  at build time (GitHub Actions runs `npm run build`, which calls `fetchPrices()`).
  Live in-browser prices come from the Cloudflare Worker (`worker/`).
- **News & Articles**: one editor for both kinds with all frontmatter fields + Markdown
  body. Drag/▲▼ to reorder → `POST /api/articles/reorder`. Writes to
  `src/content/articles/<slug>.md`.
- **Sigcamp**: edit rows inline, add/remove/reorder, then **Save table** →
  `POST /api/sigcamp` (writes `src/data/sigcamp.yml`).
- **Publish**: commits the selected content types (articles, sigcamp) to GitHub in one commit.

## Files

| Path | Purpose |
|------|---------|
| `run.py` | launcher |
| `server.py` | stdlib HTTP server + JSON API |
| `content.py` | markdown + frontmatter for articles; YAML rows for sigcamp |
| `prices.py` | CMC → CoinGecko price fetch |
| `publish.py` | GitHub Git Trees/Blobs batch commit |
| `config.py` | settings store + dotenv loader |
| `ui.html` | the dashboard UI |
