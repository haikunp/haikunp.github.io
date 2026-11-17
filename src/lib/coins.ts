// Coin catalogue for the MiniAdda price tool.
// `cg` is the CoinGecko id, `cmc` the CoinMarketCap id. Order = display order.

export interface Coin {
  symbol: string;
  name: string;
  cg: string;
  cmc: number;
}

export const COINS: Coin[] = [
  { symbol: 'BTC', name: 'Bitcoin', cg: 'bitcoin', cmc: 1 },
  { symbol: 'ETH', name: 'Ethereum', cg: 'ethereum', cmc: 1027 },
  { symbol: 'TRX', name: 'TRON', cg: 'tron', cmc: 1958 },
  { symbol: 'USDT', name: 'Tether', cg: 'tether', cmc: 825 },
  { symbol: 'BNB', name: 'BNB', cg: 'binancecoin', cmc: 1839 },
];

export function coinBySymbol(symbol: string): Coin | undefined {
  return COINS.find((c) => c.symbol.toLowerCase() === symbol.toLowerCase());
}

// Amounts offered as long-tail pages in either direction.
export const COIN_AMOUNTS = [1, 5, 10, 20, 50, 100, 500, 1000, 5000, 10000];
export const USD_AMOUNTS = [1, 2, 5, 10, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 200, 500, 1000];

// Human-friendly slug: "bitcoin-to-usd", "trx-to-usd", "tron-to-usd".
// We expose per-coin aliases (symbol + full name) so both rank.
export function coinSlug(coin: Coin): string {
  return coin.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// URL builders (all under /prices).
export function priceOfOneUrl(coin: Coin): string {
  return `/prices/price-of-1-${coin.symbol.toLowerCase()}`;
}
export function coinToUsdUrl(coin: Coin, amount: number): string {
  return `/prices/${amount}-${coinSlug(coin)}-to-usd`;
}
export function usdToCoinUrl(coin: Coin, usd: number): string {
  return `/prices/${usd}-usd-to-${coinSlug(coin)}`;
}
// Alias pages keyed by symbol (e.g. /prices/trx-to-usd, /prices/bitcoin-to-usd).
export function coinAliasUrls(coin: Coin): string[] {
  const names = [coinSlug(coin), coin.symbol.toLowerCase()];
  return Array.from(new Set(names)).map((n) => `/prices/${n}-to-usd`);
}

export function coinSlugOf(c: Coin): string {
  return c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
