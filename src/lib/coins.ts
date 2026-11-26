export interface Coin {
  symbol: string;
  name: string;
  cmc: string;
  slug: string;
}

export const CONVERSION_AMOUNTS = [1, 10, 100, 1000, '0.0001', '0.001', '0.01', '0.1'];

// Number of top coins (by market-cap order in src/data/coins.yml) that get
// static per-amount conversion pages. The rest are still selectable in the
// converter but not pre-rendered.
export const STATIC_PAGES_TOP = 100;

export function coinSlug(coin: { name: string }): string {
  return coin.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function coinBySymbol(list: Coin[], symbol: string): Coin | undefined {
  return list.find((c) => c.symbol.toLowerCase() === symbol.toLowerCase());
}
