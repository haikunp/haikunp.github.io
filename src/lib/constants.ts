export const SITE = {
  name: 'MiniAdda',
  tagline: 'Crypto prices, converters & quick answers.',
  domain: 'miniadda.com',
  url: 'https://miniadda.com',
  description:
    'MiniAdda is a fast crypto tool and news site: convert coins to USD, check live prices, browse BitcoinTalk signature campaigns and read short, sourced crypto news and articles.',
  locale: 'en_US',
  defaultAuthor: 'MiniAdda Editorial',
} as const;

// Live price feed (Cloudflare Worker). Empty string = baked prices only.
// Set after `wrangler deploy` (see worker/). The browser polls this; pages also
// ship baked prices so crawlers/no-JS users still see numbers.
export const PRICE_FEED = {
  endpoint: 'https://miniadda-prices.miniadda.workers.dev/prices.json',
  pollSeconds: 15,
  clientCacheSeconds: 10,
} as const;

// Two public content kinds share one editor and one URL space.
export const KINDS = [
  { slug: 'news', name: 'News' },
  { slug: 'article', name: 'Articles' },
] as const;

export type KindSlug = (typeof KINDS)[number]['slug'];
export const KIND_SLUGS = KINDS.map((k) => k.slug);

export function kindName(slug: string): string {
  return KINDS.find((k) => k.slug === slug)?.name ?? slug;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function topicLabel(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
