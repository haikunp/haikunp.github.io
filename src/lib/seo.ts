import { SITE } from './constants';
import type { Article } from './content';
import { articleUrl } from './content';

export interface SeoInput {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  publishedAt?: Date;
  updatedAt?: Date;
  lastVerified?: Date;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path, SITE.url).toString();
}

export function buildSeo(input: SeoInput) {
  const fullTitle = input.title.includes(SITE.name)
    ? input.title
    : `${input.title} | ${SITE.name}`;
  const image = input.image ? absoluteUrl(input.image) : `${SITE.url}/og-default.svg`;
  return {
    fullTitle,
    description: input.description,
    canonical: absoluteUrl(input.canonical),
    image,
    imageAlt: input.imageAlt ?? fullTitle,
    type: input.type ?? 'website',
    noindex: input.noindex ?? false,
    nofollow: input.nofollow ?? false,
    publishedAt: input.publishedAt,
    updatedAt: input.updatedAt,
    lastVerified: input.lastVerified,
    author: input.author,
    section: input.section,
    tags: input.tags ?? [],
  };
}

// ---- Structured data ----

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/favicon.svg`,
    description: SITE.description,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { '@id': `${SITE.url}/#organization` },
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbList(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

// Ordinary editorial Q&A articles intentionally use Article, NOT QAPage/FAQPage,
// to avoid misrepresenting user-submitted content as structured Q&A.
export function articleSchema(input: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt: Date;
  updatedAt?: Date;
  author: string;
  section?: string;
  tags?: string[];
  wordCount?: number;
}) {
  const imageUrl = input.image ? absoluteUrl(input.image) : `${SITE.url}/og-default.svg`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.url),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(input.url) },
    datePublished: input.publishedAt.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt).toISOString(),
    author: { '@type': 'Organization', name: input.author },
    publisher: { '@id': `${SITE.url}/#organization` },
    image: [imageUrl],
    inLanguage: 'en',
    ...(input.section ? { articleSection: input.section } : {}),
    ...(input.tags && input.tags.length ? { keywords: input.tags.join(', ') } : {}),
    ...(input.wordCount ? { wordCount: input.wordCount } : {}),
  };
}

// ItemList for hub pages (section, tag, topic, homepage) to help discovery.
export function itemListSchema(
  articles: Article[],
  opts: { name: string; url: string }
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    url: absoluteUrl(opts.url),
    numberOfItems: articles.length,
    itemListElement: articles.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(articleUrl(a)),
      name: a.data.title,
    })),
  };
}

export function wordCount(body: string | undefined): number {
  if (!body) return 0;
  return body.trim().split(/\s+/).filter(Boolean).length;
}
