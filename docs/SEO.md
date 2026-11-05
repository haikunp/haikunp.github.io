# SEO Implementation Checklist

Everything currently implemented on the public site, plus what the admin must enforce when writing articles.

## Implemented (public site)

### Crawlability & indexing
- [x] Fully static HTML (SSG) — no client-side rendering of article text
- [x] `robots.txt` with `Allow` + `Disallow: /search` + sitemap reference
- [x] XML sitemap (`/sitemap-index.xml`, `/sitemap-0.xml`) — excludes `/search`
- [x] `robots` meta: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`
- [x] Canonical URL on every page
- [x] Clean, directory-style URLs (`/us/next-us-election/`)
- [x] `lang="en"` on `<html>`, `hreflang` en + x-default
- [x] Sitemap `<link rel="sitemap">` in head

### Metadata
- [x] Unique `<title>` per page (article SEO title override supported)
- [x] Unique meta description per page (article SEO description override)
- [x] `author` meta
- [x] Open Graph: type, site_name, title, description, url, locale, image (+width/height/alt)
- [x] Article OG: published_time, modified_time, author, section, tag[]
- [x] Twitter/X: summary_large_image, title, description, image, image:alt
- [x] Default OG image fallback (`/og-default.svg`)

### Structured data (JSON-LD)
- [x] `Organization` (site-wide)
- [x] `WebSite` + `SearchAction` (site-wide)
- [x] `Article` (article pages): headline, description, url, mainEntityOfPage, datePublished, dateModified, author, publisher, image, inLanguage, articleSection, keywords, wordCount
- [x] `BreadcrumbList` (all inner pages)
- [x] `ItemList` (homepage, sections, tags, topics)
- [x] **Never** `QAPage`/`FAQPage`/`Review` for editorial answers (verified)

### On-page / semantic
- [x] One `<h1>` per page
- [x] Semantic `<header>`, `<main>`, `<nav aria-label>`, `<article>`, `<aside>`, `<footer>`
- [x] Breadcrumb navigation (visible + structured)
- [x] Internal linking: related articles, sections, tags, topics, latest
- [x] Question-style headlines, direct answer near top
- [x] Descriptive link text
- [x] `<time datetime>` on dates
- [x] Images: `loading`, width/height, descriptive alt (alt required when image present)

### Performance / mobile
- [x] Mobile-first responsive CSS
- [x] No heavy JS on content pages (search only loads on `/search`)
- [x] Font `display=swap`, preconnect
- [x] Minimal dependencies; no runtime framework on public pages

## Admin must enforce when publishing (Stage 4/5)

- Require: title, answer, section, topic, description, publishedAt, at least 1 source URL
- SEO title ≤ 70 chars (warn if longer), description 50–160 chars (warn if outside)
- Slug: lowercase, hyphenated, unique; never change a published slug silently (would break links)
- Tags: from the allowed REGIONS list
- **Image optional** — most articles have none. If provided:
  - require alt text (for accessibility + SEO)
  - validate type (jpg/png/webp/avif) and size (≤ ~1.5 MB)
  - store under `public/uploads/`, reference with absolute site path
- Auto-set `updatedAt` on edit, keep original `publishedAt`
- Last verified date optional but shown when present

## Future / optional
- [ ] `NewsArticle` type for genuinely time-sensitive breaking answers (vs evergreen `Article`)
- [ ] RSS/Atom feed
- [ ] `og:image` auto-generation from title when no image
- [ ] Google Search Console verification meta + sitemap submit
- [ ] Bing Webmaster verification
