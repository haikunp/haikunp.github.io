import { SITE } from './constants';

export interface SeoInput {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  type?: 'website' | 'article';
  publishedAt?: Date;
  updatedAt?: Date;
  author?: string;
  noindex?: boolean;
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path, SITE.url).toString();
}

export function buildSeo(input: SeoInput) {
  const fullTitle = input.title.includes(SITE.name) ? input.title : `${input.title} | ${SITE.name}`;
  const image = input.image ? absoluteUrl(input.image) : undefined;
  return {
    fullTitle,
    description: input.description,
    canonical: absoluteUrl(input.canonical),
    image,
    type: input.type ?? 'website',
    noindex: input.noindex ?? false,
    publishedAt: input.publishedAt,
    updatedAt: input.updatedAt,
    author: input.author,
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
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.url),
    mainEntityOfPage: absoluteUrl(input.url),
    datePublished: input.publishedAt.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt).toISOString(),
    author: { '@type': 'Organization', name: input.author },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    ...(input.image ? { image: [absoluteUrl(input.image)] } : {}),
  };
}
