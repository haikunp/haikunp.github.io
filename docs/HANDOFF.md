# MiniAdda — Handoff (resume tomorrow)

Last updated: end of session (2026-11-15). Read this first when resuming.

This doc covers the **crypto-tool pivot**: MiniAdda is now a tool-first crypto site
(converter + `/prices` + Sigcamp) with news as a smaller section, managed by one local
dashboard that publishes to GitHub. Everything below is **built, type-checked and
building green locally**, but **not yet published** — see the PAT blocker.

---

## TL;DR — current state

- **Local build:** ✅ green — `npm run build` → **179 pages**. `npx astro check` → **0 errors**.
- **Site redesign + `/prices` + Sigcamp + dashboard + worker:** ✅ built & tested locally.
- **Published to GitHub:** ❌ **NOT YET** — needs a PAT (see blocker below).
- **Repo:** `haikunp/haikunp.github.io` (branch `main`), deploys via GitHub Actions → GitHub Pages → miniadda.com.
- **Live prices:** baked at build time (works now). Optional live feed needs the Worker deployed (see below).

---

## 🔴 Do first tomorrow

1. **Get the PAT.** Create a **fine-grained** token for `haikunp/haikunp.github.io`:
   - Repository access: only `haikunp/haikunp.github.io`
   - Permissions: **Contents: Read and write** (required). Add **Workflows: Read and write**
     only if you'll ever change `.github/`.
   - Put it in `miniadda/.env` (gitignored):
     ```
     MINIADDA_GITHUB_TOKEN=github_pat_xxx
     ```
2. **Publish.** Either run the dashboard (Publish tab) or the CLI-ish path below.
   This commits the new source to GitHub; Actions rebuilds and deploys. Verify the
   Actions run goes green and miniadda.com shows the new converter/prices.
3. **(Optional) Deploy the Worker** so in-browser prices go live every ~15s:
   `cd worker && npx wrangler deploy`, then confirm the endpoint in
   `src/lib/constants.ts` (`PRICE_FEED.endpoint`) matches the deployed `*.workers.dev` URL.

---

## What changed this session

### Design / positioning
- MiniAdda is now **tool-first, crypto-focused**. The homepage leads with the
  **crypto ↔ USD converter**, then live prices, then a smaller **Crypto news** section,
  then a **Signature campaigns** teaser.
- **Search removed**: deleted `src/pages/search.astro`, `src/pages/search-index.json.ts`,
  `src/components/SearchBar.astro`; removed `SearchAction` from the WebSite schema.
- **Navbar** (`Header.astro`): `Prices · Sigcamp · News` (no Home / All-prices clutter).

### New features
- **Price converter** component: `src/components/PriceConverter.astro`
  - Two-way: coin amount ↔ USD amount, editable unit price, coin search + switch.
  - Baked prices via props; upgrades to live from the Worker feed.
  - Styled with MiniAdda's brutalist design (classes `.convx*` in `global.css`).
- **`/prices` pages** (in MiniAdda design):
  - `src/pages/prices/index.astro` — hub with converter + live price table + popular conversions.
  - `src/pages/prices/[slug].astro` — generates all long-tail variants:
    - `price-of-1-<sym>` (e.g. `/prices/price-of-1-btc`)
    - `<name>-to-usd` and `<sym>-to-usd` aliases (e.g. `/prices/bitcoin-to-usd`, `/prices/trx-to-usd`, `/prices/tron-to-usd`)
    - `<amount>-<name>-to-usd` (e.g. `/prices/1000-bitcoin-to-usd`)
    - `<amount>-usd-to-<name>` (e.g. `/prices/100-usd-to-tron`)
  - **150 price URLs** in the sitemap.
- **Sigcamp** (BitcoinTalk signature campaigns):
  - Content collection `sigcamp` (`src/content/sigcamp/*.md`) + schema in `src/content.config.ts`.
  - Pages: `src/pages/sigcamp/index.astro`, `src/pages/sigcamp/[slug].astro`.
  - 2 sample campaigns included (replace via dashboard).
- **Live price feed**: `src/lib/constants.ts` → `PRICE_FEED` (endpoint/poll/cache).
- **Worker**: `worker/index.js` + `worker/wrangler.toml` (`miniadda-prices`), CMC public →
  CoinGecko fallback, 15s cache, CORS, `/health`.

### Dashboard (new, `dashboard/`)
One local panel for everything (Python stdlib only — no pip installs):
- **Prices** tab: live prices preview.
- **Articles** tab: create/edit/delete articles (`src/content/articles/*.md`) with all
  frontmatter fields + Markdown body.
- **Sigcamp** tab: create/edit/delete campaigns (`src/content/sigcamp/*.md`).
- **Publish** tab: commits selected content to GitHub via the API (single commit) → Actions deploy.

Run:
```bash
cd miniadda
python3 dashboard/run.py      # http://127.0.0.1:8787
```

See `dashboard/README.md` for details.

### Libs
- `src/lib/coins.ts` — coin catalogue (BTC, ETH, TRX, USDT, BNB), amounts, slug/URL helpers.
- `src/lib/prices.ts` — build-time price fetch (CMC public → CoinGecko fallback) + formatters.

---

## Files map (what's new / changed)

**New**
- `src/components/PriceConverter.astro`
- `src/lib/coins.ts`, `src/lib/prices.ts`
- `src/pages/prices/index.astro`, `src/pages/prices/[slug].astro`
- `src/pages/sigcamp/index.astro`, `src/pages/sigcamp/[slug].astro`
- `src/content/sigcamp/*.md` (2 samples)
- `dashboard/` (whole dir), `worker/` (whole dir)
- `.env.example` (PAT + optional CMC key placeholders)

**Changed**
- `src/pages/index.astro` — tool-first homepage
- `src/components/Header.astro` — new nav
- `src/styles/global.css` — `.convx*` + `.price-table` styles
- `src/content.config.ts` — added `sigcamp` collection
- `src/lib/constants.ts` — `PRICE_FEED`
- `src/lib/content.ts` — sigcamp helpers
- `src/lib/seo.ts` — dropped SearchAction
- `README.md` — repositioned
- `.gitignore` — added `dashboard/__pycache__/`, `dashboard/data/`

**Deleted**
- `src/pages/search.astro`, `src/pages/search-index.json.ts`, `src/components/SearchBar.astro`

---

## How to verify (do this tomorrow before/after publishing)

```bash
cd miniadda
npm run check      # expect 0 errors
npm run build      # expect ~179 pages
# spot-check output:
ls dist/prices | head            # many slug dirs
grep -o '/prices/[^<]*' dist/sitemap-0.xml | wc -l   # ~150
```
Dashboard smoke test:
```bash
python3 dashboard/run.py &
curl -s localhost:8787/api/token        # before PAT: {"ok":false,"error":"No token set"}
curl -s localhost:8787/api/prices       # live prices
curl -s localhost:8787/api/articles | head -c 200
curl -s localhost:8787/api/sigcamp   | head -c 200
```
After PAT: dashboard Publish tab (or POST `/api/publish` with `{"what":["articles","sigcamp"]}`)
→ check the commit URL returned, then the Actions run, then miniadda.com.

---

## Publishing notes / gotchas

- **Auth path:** Dashboard → `publish.py` → GitHub **Git Trees + Blobs API** (blobs are
  created via the Blobs API so binary/large content is safe), single commit per publish.
- **Base path:** `dashboard/config.py` default `base_path=""` (repo root). Correct for
  miniadda.com on `haikunp/haikunp.github.io`.
- **Branch:** `main` (matches repo + workflow). Token env var: `MINIADDA_GITHUB_TOKEN`,
  loaded from `miniadda/.env` by `dashboard/config.py`.
- **Prices** are baked during the Actions build (it runs `npm run build` → `fetchPrices()`).
  The dashboard does not push price data; it only previews prices and commits content.
  If `fetchPrices()` fails at build time it returns `{}` and the build still succeeds
  (shows `—`), so a transient CMC/CoinGecko outage won't break deploys.
- **Worker** must be deployed separately for *live* (in-browser) prices; baked prices
  work without it.
- If Actions fails on push, check the run log; the previous deploy job remains live.

---

## Known limitations / next steps (beyond publishing)

- **Sigcamp data is manual/sample.** Requirement mentioned "list signature campaigns
  active in bitcointalk" — currently campaigns are entered via the dashboard. Possible
  next step: a scraper or curated feed to auto-populate `src/content/sigcamp/`.
- **Articles** are still the 9 existing quick-answers re-tagged; reposition toward
  **crypto news** content over time. The dashboard makes authoring easy.
- **Taxonomy:** `docs/PLAN.md` proposed a country-based taxonomy for articles; not done.
  Articles still use `section: us|international`. Low priority given crypto-tool focus.
- **Live feed endpoint** in `constants.ts` is a placeholder until `wrangler deploy`.
- **No server-side rendering** — all static; that's intentional (GitHub Pages).

---

## Command reference

```bash
# site
cd miniadda
npm run dev            # http://localhost:4321
npm run build          # dist/  (~179 pages)
npm run check          # astro type check (0 errors expected)

# dashboard
python3 dashboard/run.py         # http://127.0.0.1:8787

# worker (optional live prices)
cd worker && npx wrangler deploy
npx wrangler secret put CMC_API_KEY --config worker/wrangler.toml   # optional

# git (after PAT configured; or let the dashboard commit)
git add -A && git commit -m "..." && git push origin main
```

> Note: the GitHub remote push here uses your credentials; the dashboard publishes via
> the API with the PAT instead, so you don't have to store a git credential.
