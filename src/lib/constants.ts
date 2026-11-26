export const SITE = {
  name: 'MiniAdda',
  tagline: 'Simple, useful tools in one place.',
  domain: 'miniadda.com',
  url: 'https://miniadda.com',
  description:
    'MiniAdda is a lightweight collection of simple tools: live crypto prices, BitcoinTalk signature campaigns and CPU-mineable coins.',
  locale: 'en_US',
} as const;

export const PRICE_FEED = {
  endpoint: 'https://miniadda-prices.samundrana.workers.dev/prices.json',
  pollSeconds: 5,
  clientCacheSeconds: 3,
} as const;
