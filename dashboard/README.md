# MiniAdda Dashboard

A local, combined admin panel for the MiniAdda site. One place to manage all three
content types and publish them to GitHub:

- **Prices** — live coin prices (from CoinMarketCap/CoinGecko) for the `/prices` tool.
- **Articles** — the crypto news / quick-answer articles (`src/content/articles/`).
- **Sigcamp** — BitcoinTalk signature campaign listings (`src/content/sigcamp/`).

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
- **Articles**: create/edit/delete articles with all frontmatter fields + Markdown body.
  Writes directly to `src/content/articles/<slug>.md`.
- **Sigcamp**: create/edit/delete signature campaigns (`src/content/sigcamp/<slug>.md`).
- **Publish**: commits the selected content types to GitHub in a single commit.

## Files

| Path | Purpose |
|------|---------|
| `run.py` | launcher |
| `server.py` | stdlib HTTP server + JSON API |
| `content.py` | markdown + frontmatter read/write (articles, sigcamp) |
| `prices.py` | CMC → CoinGecko price fetch |
| `publish.py` | GitHub Git Trees/Blobs batch commit |
| `config.py` | settings store + dotenv loader |
| `ui.html` | the dashboard UI |
