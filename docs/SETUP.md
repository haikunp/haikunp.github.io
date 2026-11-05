# Setup & Deployment

Instructions for connecting the site to GitHub Pages, Cloudflare Pages, Workers and Access.

> Empty until the relevant stages land. Each stage appends its section here.

## Prerequisites

- GitHub account with a **public** repo (required for free GitHub Pages)
- Cloudflare account (free tier)
- DNS control for `miniadda.com`
- (Stage 5) A GitHub **fine-grained** personal access token scoped to the single repo (contents read/write only)

## Hosting decisions (locked)

- **Public site:** GitHub Pages from a public repo (free).
- **Admin:** Cloudflare Pages, random `*.pages.dev` URL (free), behind Cloudflare Access.
- **API:** Cloudflare Worker with the PAT stored as a secret (free).
- **No drafts:** the admin publishes final articles directly.
- **DNS:** moved from Namecheap to **Cloudflare DNS** (free) because Namecheap rejected the
  four GitHub A records. Cloudflare then points to GitHub Pages. See `docs/PLAN.md`.

## Stage 3 — GitHub Pages / DNS (in progress)

See `docs/PLAN.md` §1 for the full Cloudflare-DNS → GitHub Pages steps.

Summary:
1. Namecheap nameservers → Cloudflare's two nameservers.
2. Cloudflare DNS: four A records (`185.199.108-111.153`) + `www` CNAME → `haikunp.github.io`,
   all **DNS only (grey cloud)**; optional AAAA records.
3. GitHub Settings → Pages → Custom domain `miniadda.com` → Enforce HTTPS.

## Stage 3 — GitHub Pages (pending)

_To be filled when Stage 3 begins._

## Stage 4 — Admin (pending)

_To be filled when Stage 4 begins._

## Stage 5 — Worker (pending)

_To be filled when Stage 5 begins._

## Stage 6 — Access (pending)

_To be filled when Stage 6 begins._
