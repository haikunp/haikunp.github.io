# Progress Checklist

Track completed and pending stages. Update after each stage passes testing.

## Stage 1 — Planning ✅
- [x] Inspect environment (Node 24, npm 12, git, gh not authed)
- [x] Propose architecture and repo structure
- [x] Identify accounts/config required
- [x] Document limitations
- [x] Owner approval received

## Stage 2 — Public website ✅
- [x] Initialize Astro (v7, static output)
- [x] Content collection schema (Zod) — section, topic, tags, no drafts
- [x] Design pass: brutalist/tactile, mobile-first, Gen-Z friendly
- [x] Two sections (US / International) + topic chips + country/region tag filters
- [x] Homepage: hero, search, trending, US, International, tags, topics, latest
- [x] Article template: quick answer, ad slot, breadcrumbs, sources, related, sidebar
- [x] Section pages, tag pages (`/tags/[tag]`), topic pages (`/topics/[topic]`)
- [x] Static pages: About, Contact, Privacy, Editorial Policy
- [x] Client-side search (`/search` + `/search-index.json`)
- [x] SEO: canonical, OG, Twitter, sitemap, robots, JSON-LD (Article + Breadcrumb + WebSite only)
- [x] Configurable ad slots (banner + sidebar, off by default)
- [x] 9 sample articles re-tagged to new model
- [x] Local build + type check verified (27 pages, ads emit nothing)
- [x] Mobile & desktop visual check (Chromium screenshots)

## Stage 3 — GitHub deployment ⬜
- [ ] Create private GitHub repo
- [ ] `.github/workflows/deploy.yml`
- [ ] Enable GitHub Pages
- [ ] Custom domain `miniadda.com` + DNS
- [ ] Verify live site

## Stage 4 — Admin interface ⬜
- [ ] `admin/` Cloudflare Pages SPA
- [ ] Dashboard, list, search/filter, status
- [ ] Article editor: all fields, Markdown + live preview
- [ ] Save draft / publish / unpublish / delete (confirm)
- [ ] Publishing history
- [ ] Responsive/mobile

## Stage 5 — Cloudflare publishing API ⬜
- [ ] Worker scaffold (`worker/`)
- [ ] Access JWT verification (JWKS)
- [ ] Zod validation + path allowlist
- [ ] GitHub Contents API (commit)
- [ ] Image upload (type/size validation)
- [ ] Rate limiting + audit log
- [ ] `GITHUB_TOKEN` as Worker secret

## Stage 6 — Cloudflare Access ⬜
- [ ] Access app on admin Pages
- [ ] Email allowlist policy
- [ ] Verify unauthorized access blocked
- [ ] Protect Worker API endpoints

## Stage 7 — End-to-end publishing ⬜
- [ ] Create + publish test article via admin
- [ ] Verify GitHub commit
- [ ] Verify Actions build + Pages deploy
- [ ] Verify article live on miniadda.com
- [ ] Test edit / unpublish / delete

## Stage 8 — Security audit ⬜
- [ ] No credentials in frontend/HTML/responses/logs
- [ ] Auth bypass attempts fail
- [ ] API authorization verified
- [ ] Invalid/malicious input rejected
- [ ] Repo stays private
- [ ] Admin inaccessible without authorization
