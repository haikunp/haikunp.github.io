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

## Stage 3 — GitHub Pages (pending)

_To be filled when Stage 3 begins._

## Stage 4 — Admin (pending)

_To be filled when Stage 4 begins._

## Stage 5 — Worker (pending)

_To be filled when Stage 5 begins._

## Stage 6 — Access (pending)

_To be filled when Stage 6 begins._
