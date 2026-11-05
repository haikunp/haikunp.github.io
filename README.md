# MiniAdda

**Quick answers to the questions everyone is asking.**

A fast, mobile-first information site with a brutalist/tactile Gen-Z-friendly design. Public site is fully static (GitHub Pages, free). Content is published from a private, Cloudflare-Access-protected admin panel through a Cloudflare Worker that commits to the public GitHub repo.

## Status

See [`docs/PROGRESS.md`](docs/PROGRESS.md) for the stage checklist.

- [x] Stage 1 — Planning & architecture
- [x] Design pass — brutalist/tactile, mobile-first, sections + tags, ad slots
- [x] Stage 2 — Public website (Astro)
- [ ] Stage 3 — GitHub deployment
- [ ] Stage 4 — Admin interface
- [ ] Stage 5 — Cloudflare publishing API (Worker)
- [ ] Stage 6 — Cloudflare Access
- [ ] Stage 7 — End-to-end publishing
- [ ] Stage 8 — Security audit

## Hosting model (all free)

| Part | Where | Cost |
| --- | --- | --- |
| Public site | GitHub Pages (public repo) | Free |
| Admin UI | Cloudflare Pages (random `*.pages.dev`) | Free |
| Publishing API | Cloudflare Workers | Free |
| Auth | Cloudflare Access (≤50 users) | Free |
| CI | GitHub Actions | Free (2,000 min/mo private; public repos unlimited) |

**Why a public repo?** GitHub Pages on the Free plan requires a public repo. Articles are public anyway, and there are **no drafts** — the admin commits final articles directly. If you later need private drafts, switch Pages to Cloudflare Pages (also free) built from a private repo.

## Content model

- **Sections** (2): `us`, `international` — top-level navigation.
- **Topics** (chips): politics, technology, business, finance, entertainment, science, sports, general-knowledge.
- **Tags** (country/region): us, florida, california, new-york, texas, uk, belgium, canada, australia, india, germany, france, global.
- **No drafts.** Admin publishes directly; edits replace the file.

Routes: `/`, `/[section]`, `/[section]/[slug]`, `/tags/[tag]`, `/topics/[topic]`, `/search`, plus About/Contact/Privacy/Editorial.

## Ads

Config in [`src/lib/ads.ts`](src/lib/ads.ts). No ads render while `ads.enabled` is `false`. Two placement types:

- **banner** — inline unit in the article flow (default: after the quick answer).
- **sidebar** — sticky desktop unit (hidden on mobile).

To enable later: set `enabled: true`, add your AdSense `publisherId` (`ca-pub-…`) and each placement's `slotId`. The AdSense loader is injected in `BaseLayout` only when enabled.

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static output in dist/
npm run preview
npm run check        # astro type/diagnostic check
```

Background dev server (`AGENTS.md`): `astro dev --background`, `astro dev status`, `astro dev stop`, `astro dev logs`.

## Adding an article (manually)

Create `src/content/articles/<slug>.md`:

```yaml
---
title: "Who owns OpenAI?"
answer: "A short, direct answer shown near the top."
section: "international"        # us | international
topic: "technology"             # see TOPICS in src/lib/constants.ts
tags: ["us", "global"]          # see REGIONS in src/lib/constants.ts
description: "Meta description."
sources:
  - label: "Source name"
    url: "https://example.com"
author: "MiniAdda Editorial"
publishedAt: 2026-01-15
lastVerified: 2026-06-02
trending: false
---
```

URL becomes `/<section>/<filename>`. Keep filenames lowercase-hyphenated.

## SEO

Static HTML, unique titles/meta, canonical URLs, sitemap (excludes `/search`), robots.txt, Open Graph, Twitter cards. Structured data: `Article` + `BreadcrumbList` + `WebSite` only — **never** `QAPage`/`FAQPage`/`Review` for editorial answers.

## Security

GitHub token lives only as a Worker secret. Admin protected by Cloudflare Access; the Worker independently verifies the Access JWT. Content/image writes restricted to an allowlist. See [`docs/SECURITY.md`](docs/SECURITY.md).

## Deployment

See [`docs/SETUP.md`](docs/SETUP.md).
