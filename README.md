# MiniAdda

**Simple, useful tools in one place.**

A lightweight tool-aggregation site. The homepage is just the site name and a
grid of tool cards — no navbar, no footer, one shared stylesheet for every page.
The public site is fully static (GitHub Pages).

## Tools (pages)

| Route | Tool |
| --- | --- |
| `/` | Homepage — name + cards linking to each tool |
| `/crypto-price` | Live crypto prices (USD) + coin search + two-way converter, auto-refreshing |
| `/sigcamp` | BitcoinTalk signature campaigns table (project type, coin, slots, payment, status) |
| `/cpu-mining` | CPU-mineable coins with pool + exchange links |
| `/convert/<amount>-<coin>-to-usd` | Auto-generated conversion pages (e.g. `10-tron-to-usd`, `0.0001-btc-to-usd`) |

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview
npm run check      # astro type/diagnostic check
```

Background dev server (`AGENTS.md`): `astro dev --background`, `astro dev status`, `astro dev stop`, `astro dev logs`.

## Dashboard

A small local admin at `dashboard/` (Python, no dependencies) edits the two
table-based tools and publishes to GitHub:

- **Signature Campaigns** → `src/data/sigcamp.yml`
- **CPU Mining Coins** → `src/data/cpu-coins.yml`

Each is a simple responsive table with **add / edit / reorder (▲▼) / delete**.
Serial number follows row order and that order is what the site shows.

```bash
python3 -m dashboard.run     # opens http://127.0.0.1:8787/
```

Publishing commits the YAML files through the GitHub API; GitHub Actions then
builds and deploys. The token lives only in `.env` as `MINIADDA_GITHUB_TOKEN`
(see `.env.example`) and is never committed.

## Data files

Both tables share one flat row format (`rows:` + `- key: value` items) parsed by
`src/lib/table.ts` at build time:

```yaml
rows:
  - name: "..."
    # sigcamp: subtitle (project type e.g. Gambling/Exchange), coin, slots,
    #          payment, status (OPEN|CFNP|HOLD|END), link
    # cpu:     symbol, algorithm, pool, exchange
```

Multi-value cells (`slots`, `payment`, `pool`, `exchange`) are stored on one line
separated by ` ; ` and rendered as lists. The dashboard edits them as one-item-
per-line textareas.

## Prices

`src/lib/prices.ts` bakes prices at build time (CoinMarketCap public listing,
CoinGecko fallback) so pages work without JS. The `/crypto-price` and every
`/convert/...` page then poll the Cloudflare Worker in `worker/` every 5s and
update in place (no refresh). The Worker caches upstream calls for 5s and sends
`no-store` so the browser/edge never serves stale numbers. Configure via
`src/lib/constants.ts` → `PRICE_FEED`.

### Conversion pages (SEO)

`src/pages/convert/[slug].astro` generates a page per coin × amount in
`CONVERSION_AMOUNTS` (`src/lib/coins.ts`), keyed by both coin name and symbol
slugs. Each has its own title, meta description, canonical URL and WebPage
schema.

## Deployment

Static output in `dist/` → GitHub Pages. The price feed Worker is deployed with
`wrangler` from `worker/`.
