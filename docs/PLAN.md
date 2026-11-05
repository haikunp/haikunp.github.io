# MiniAdda — Remaining Plan (resume tomorrow)

Last updated: 2026-11-05 (end of session)

This document is the single source of truth for what's done, what changed, and exactly what to do next. Read this first when resuming.

---

## TL;DR — current state

- **Live (GitHub Pages):** https://haikunp.github.io/ — Astro site, brutalist/tactile, mobile-first.
- **Done:** Stage 1 (planning), Stage 2 (site + design + SEO overhaul).
- **Paused:** Stage 3 (custom domain) — blocked on DNS, see next section.
- **Next up:** Stage 3 finish → Stage 4 (admin) → Stage 5 (Worker) → Stage 6 (Access) → Stage 7 (E2E) → Stage 8 (audit).
- **Repo:** public `haikunp/haikunp.github.io` (required for free Pages; articles have no drafts).
- **PAT:** was pasted in chat → **must be revoked**. Do it now if not already done.

---

## 🔴 Do first when resuming

1. **Revoke the old PAT** at https://github.com/settings/tokens (it was exposed in chat).
2. **DNS re-plan (changed):** Namecheap blocks the 4 GitHub A records. New plan:
   Namecheap nameservers → **Cloudflare** (free) → then point records to GitHub Pages.
   Detailed steps below.

---

## 1. DNS / hosting plan (revised)

### Why the change
Namecheap's Advanced DNS would not allow all four GitHub Pages A records.
Solution: move DNS management to **Cloudflare** (free), which also gives us:
- Better DNS UI, no 4-record limit
- One place for the admin domain + Cloudflare Access later (Stage 6)
- Free SSL, proxy option, and Worker routes

### Steps (user, one-time)
1. Create a Cloudflare account → **Add a site** → `miniadda.com` → Free plan.
2. Cloudflare gives 2 nameservers (e.g. `ada.ns.cloudflare.com`, `bob.ns.cloudflare.com`).
3. In **Namecheap → Domain List → miniadda.com → Manage → Nameservers**:
   select **Custom DNS** and enter Cloudflare's two nameservers. Save.
4. Wait for Cloudflare to show the domain as **Active** (minutes to a few hours).
5. In **Cloudflare → DNS**, add for the public site:

   | Type | Name | Content | Proxy |
   |---|---|---|---|
   | A | `@` | `185.199.108.153` | DNS only (grey) |
   | A | `@` | `185.199.109.153` | DNS only |
   | A | `@` | `185.199.110.153` | DNS only |
   | A | `@` | `185.199.111.153` | DNS only |
   | CNAME | `www` | `haikunp.github.io` | DNS only |
   | AAAA | `@` | `2606:50c0:8000::153` | DNS only |
   | AAAA | `@` | `2606:50c0:8001::153` | DNS only |
   | AAAA | `@` | `2606:50c0:8002::153` | DNS only |
   | AAAA | `@` | `2606:50c0:8003::153` | DNS only |

   **Important:** keep these GitHub records **DNS only (grey cloud)**, not proxied.
   GitHub manages its own TLS for the custom domain; proxying can break cert issuance.

6. GitHub → **Settings → Pages** → Custom domain `miniadda.com` → Save → wait for DNS check → **Enforce HTTPS**.
   (The PAT we used lacks Pages permission, so this toggle is manual.)
7. Later, for the admin (Stage 6), we will add a proxied record under a random `*.pages.dev`
   subdomain or a proxied custom admin host — decided in Stage 6. We are NOT using
   `admin.miniadda.com`.

### Verify
```bash
dig miniadda.com +short
dig www.miniada.com +short
curl -sI https://miniadda.com/ | head -1
```
Expected: GitHub IPs; then HTTP 200 and HTTPS.

### If DNS is on Cloudflare, a Worker later:
Cloudflare lets the Worker live on a route or a `*.workers.dev` URL; admin stays on
`*.pages.dev` behind Access. No public admin hostname on miniadda.com.

---

## 2. Content/navigation model change (IMPORTANT)

### Decision
Drop the two fixed sections **US** and **International** in the nav.
Instead the site is **country-based**: an international platform where each country is a
primary category and sub-places (states, regions, cities) are tags.

### New taxonomy

- **Country** (primary category, drives URLs + nav):
  - ISO-ish slugs: `us`, `be`, `gb`, `ca`, `au`, `in`, `de`, `fr`, `...`
  - Nav shows **only countries that currently have articles** (could be 1, could be many).
  - Order: a curated priority order (US first), then alphabetical, or by article count — decide in Stage 4. Default proposal: US first, then countries with most articles, then A–Z.

- **Place / region tags** (sub-location within a country):
  - States: `florida`, `california`, `new-york`, `texas`, …
  - Cities/regions as needed: `brussels`, `flanders`, …
  - A place tag belongs to a country (e.g. `florida` → `us`, `brussels` → `be`).

- **Topic** (secondary filter, stays): politics, technology, business, finance,
  entertainment, science, sports, general-knowledge.

### Article frontmatter (target schema)
```yaml
country: "us"                 # REQUIRED: primary category (drives /us/...)
place: "florida"              # OPTIONAL: sub-place tag (state/city/region)
topic: "politics"             # REQUIRED: topic chip
# tags: []                    # OPTIONAL freeform extras (keep small)
```

Replace old `section` + `tags` with `country` + `place` (+ optional `topic`).
Route changes:
- `/us/` (country hub) — lists US articles, filter by place/topic
- `/us/florida/` (place hub) — optional nested place pages
- `/us/<slug>/` (article)
- `/topics/<topic>/` stays
- Remove `/international`, `/tags/*` → replaced by `/us/florida` style or keep `/places/<place>` (decide)

### Migration of the 9 current articles (proposed)
| file | country | place | topic |
|---|---|---|---|
| federal-reserve | us | — | business |
| how-vaccines-work | global | — | science |
| latest-iphone | global | — | technology |
| next-us-election | us | — | politics |
| tallest-mountain | global | — | general-knowledge |
| us-midterm-winner | us | — | politics |
| who-owns-openai | us | — | technology |
| why-bitcoin-fall | global | — | finance |
| world-cup-winner | global | — | sports |

> `global` becomes a special "country" (works for worldwide answers). Nav can show `Global`
> first or last. Decide in Stage 4.

### Nav design (mobile-first)
- Top bar: logo + horizontally scrollable country chips (US, Belgium, UK, … only ones with content).
- A "All / Global" entry, and/or a "Countries ▾" expander if many.
- No US/International toggle anymore.

### SEO implications
- Country hub pages become important landing pages (target "<country> news/answers").
- `ItemList` + `BreadcrumbList` on country and place hubs (already have the helper).
- `articleSection` = country name.
- `article:tag` = place + topic.
- Ensure only countries with content are in nav AND sitemap (avoid thin/empty pages).

---

## 3. Image handling (decided)

- **Images are optional.** Most articles will have none.
- If an image is provided:
  - alt text is required (accessibility + SEO)
  - validate type (jpg/png/webp/avif) + size (≤ ~1.5 MB)
  - stored in `public/uploads/`, referenced by absolute site path `/uploads/<file>`
- If no image: use `og-default.svg` for social; article still fully valid.
- Admin UI: image field clearly marked "optional".

---

## 4. Stage 3 remaining (finish tomorrow)

- [ ] User: move DNS to Cloudflare (steps above)
- [ ] User: Cloudflare DNS records → GitHub Pages (grey cloud)
- [ ] User: GitHub Pages custom domain `miniadda.com` + Enforce HTTPS
- [ ] Verify `miniadda.com` + `www` serve the site over HTTPS
- [ ] Confirm Actions deploy green after the domain change

---

## 5. Stage 4 — Admin interface (next build phase)

Hosted on **Cloudflare Pages**, random `*.pages.dev` URL, behind Access (Stage 6).
Standalone static SPA (no server secrets). Talks only to the Worker (Stage 5).

### Tech
- Plain TypeScript + Vite (or Astro islands) — keep it light.
- Markdown editor with **live preview** using the same CSS as the public article.
- No framework lock-in; prefer small, maintained libs (e.g. TinyMDE/CodeMirror or a
  simple textarea + preview). Decide and document.

### Screens
1. **Login state** — relies on Cloudflare Access (no custom login form). Show who's signed in (email from Access header injected by Worker).
2. **Dashboard** — list articles (country, place, topic, status, updated), search + filters, "New article".
3. **Editor** — fields:
   - title (required)
   - slug (auto from title, editable, uniqueness check)
   - direct answer (required, short)
   - body (Markdown, live preview)
   - country (required, dropdown from REGIONS)
   - place (optional, filtered by country)
   - topic (required)
   - description / SEO title / SEO description (with char counters)
   - featured image (optional: upload or URL) + alt
   - sources (repeatable label+URL)
   - author (default MiniAdda Editorial)
   - publishedAt (default now), updatedAt (auto), lastVerified (optional)
   - flags: featured, trending
4. **Publish flow** — button calls Worker; show real status: committing → committed → deployed / error. Never show success before GitHub accepts the commit.
5. **History** — recent publish actions from Worker audit log.
6. **Delete/unpublish** — confirmation dialog.

### Admin should enforce SEO rules (see docs/SEO.md)
Char limits, required fields, unique slug, valid tags, image rules.

---

## 6. Stage 5 — Cloudflare Worker (publishing API)

- Verify **Cloudflare Access JWT** on every request (JWKS + `aud` + email allowlist).
- Validate article with Zod (shared schema with the site).
- Commit to GitHub via Contents API using **`GITHUB_TOKEN` Worker secret** (fine-grained, contents+workflows, this repo only).
- Path allowlist: only `src/content/articles/**` and `public/uploads/**`.
- Image upload: validate by magic bytes + size; commit binary.
- Rate limiting (KV or Durable Object) + audit log.
- Return structured job status; admin polls for deploy state.
- **Fresh PAT required** — set with `wrangler secret put GITHUB_TOKEN` (never in chat/files).

---

## 7. Stage 6 — Cloudflare Access

- Access app on the admin Pages project; email allowlist = your email.
- Worker also independently verifies Access JWT (defense in depth).
- Test: unauthenticated request → blocked; wrong email → blocked.
- Ensure preview/API endpoints are covered.

---

## 8. Stage 7 — End-to-end

Create → publish → verify GitHub commit → verify Actions → verify live on miniadda.com
→ edit → unpublish/delete. Confirm admin status matches reality.

---

## 9. Stage 8 — Security audit

- No token in frontend/HTML/network/logs.
- Auth bypass attempts fail; wrong-email JWT fails.
- Invalid/malicious input rejected (path traversal, oversize image, bad types).
- Repo privacy/docs; admin unreachable without Access.
- Rate limiting verified.

---

## 10. Housekeeping / decisions to confirm tomorrow

- [ ] Country nav ordering (priority vs count vs A–Z). Proposal: US first, then count desc, then A–Z.
- [ ] Is `global` a country chip or a separate "Worldwide" entry?
- [ ] Nested place URLs `/us/florida` vs flat `/places/florida`. Proposal: nested.
- [ ] Homepage after taxonomy change: "Trending" + country rows (only-populated countries) + topics.
- [ ] Editor library choice (Markdown+preview).
- [ ] Keep `/international` redirect → `/` or drop.
- [ ] Migrate the 9 sample articles to new frontmatter (country/place/topic).
- [ ] Revoke old PAT; create fresh one for Stage 5 only.
- [ ] Google Search Console + Bing verification (after custom domain live).

---

## 11. Command reference

```bash
# dev
npm run dev            # http://localhost:4321
npm run build          # dist/
npm run check          # astro type check
astro dev --background # background dev server (AGENTS.md)

# git (remote already set to haikunp/haikunp.github.io)
git add -A && git commit -m "..."
git push origin main   # prompts for credentials; do NOT store PAT in repo
```

## 12. Files map (current)
- Public pages: `src/pages/` (`index`, `[section]`, `tags/[tag]`, `topics/[topic]`, `search`, static)
- Content schema: `src/content.config.ts`
- Taxonomy/constants: `src/lib/constants.ts`
- SEO helpers: `src/lib/seo.ts` (see `docs/SEO.md`)
- Ads config: `src/lib/ads.ts`
- Content helpers: `src/lib/content.ts`
- Styles: `src/styles/global.css`
- Deploy: `.github/workflows/deploy.yml`, `public/CNAME`
- Docs: `README.md`, `docs/PROGRESS.md`, `docs/SEO.md`, `docs/SECURITY.md`, `docs/SETUP.md`, this file (`docs/PLAN.md`)

> Note: taxonomy will change from `section`→`country`+`place` in Stage 4 work; files above
> marked "taxonomy" and "pages" will be refactored accordingly.
