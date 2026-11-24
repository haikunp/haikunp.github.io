import { COINS, coinBySymbol, coinFromSymbol, type Coin } from './coins';

export type PriceMap = Record<string, number>;

const UA = 'MiniAdda/1.0 (+https://miniadda.com)';

async function getJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fromCoinGecko(): Promise<PriceMap> {
  const ids = COINS.map((c) => c.cg).join(',');
  const data = await getJson(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
  );
  const out: PriceMap = {};
  for (const c of COINS) {
    const e = data[c.cg];
    if (e && typeof e.usd === 'number') out[c.symbol] = e.usd;
  }
  return out;
}

async function fromCoinMarketCapPublic(): Promise<PriceMap> {
  const byId = new Map(COINS.map((c) => [c.cmc, c]));
  const out: PriceMap = {};
  let start = 1;
  const limit = 250;
  for (let page = 0; page < 3; page++) {
    const data = await getJson(
      `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=${start}&limit=${limit}&sortBy=market_cap&sortType=desc`
    );
    const list = data?.data?.cryptoCurrencyList ?? [];
    if (!list.length) break;
    for (const item of list) {
      const coin = byId.get(item.id);
      if (!coin) continue;
      const q = (item.quotes ?? []).find((x: any) => x.name === 'USD' || x.convert === 'USD');
      if (q) out[coin.symbol] = Number(q.price);
    }
    if (Object.keys(out).length === COINS.length) break;
    start += limit;
  }
  return out;
}

export interface PriceResult {
  prices: PriceMap;
  source: string;
}

// Module-level memo. Every /prices page calls fetchPrices() during a single
// build; without this each page re-hit the network (hundreds of requests).
// Cache the in-flight promise so concurrent renders share one fetch.
let pricePromise: Promise<PriceResult> | null = null;

// Fetch prices at build time. Tries CMC public listing first, CoinGecko fallback.
// Never throws: on total failure returns an empty map so the build still succeeds.
export function fetchPrices(): Promise<PriceResult> {
  if (!pricePromise) pricePromise = loadPrices();
  return pricePromise;
}

async function loadPrices(): Promise<PriceResult> {
  try {
    const p = await fromCoinMarketCapPublic();
    if (Object.keys(p).length) return { prices: p, source: 'coinmarketcap' };
  } catch {
    /* fall through */
  }
  try {
    const p = await fromCoinGecko();
    if (Object.keys(p).length) return { prices: p, source: 'coingecko' };
  } catch {
    /* fall through */
  }
  return { prices: {}, source: 'unavailable' };
}

// Ordered list of every coin available for the price tables/pages: the curated
// catalogue first (that we have markets for), then any extra coins the feed
// returned, in feed order. Coins with no baked price are dropped so tables and
// auto-generated pages never show a dangling "—".
export function availableCoins(prices: PriceMap): Coin[] {
  const curated = COINS.filter((c) => prices[c.symbol] != null);
  const seen = new Set(curated.map((c) => c.symbol));
  const extras: Coin[] = [];
  for (const symbol of Object.keys(prices)) {
    if (seen.has(symbol)) continue;
    const known = coinBySymbol(symbol);
    extras.push(known ?? coinFromSymbol(symbol));
    seen.add(symbol);
  }
  // No live data at all: fall back to the curated catalogue so pages still build.
  if (!curated.length && !extras.length) return [...COINS];
  return [...curated, ...extras];
}

// ---- formatting ----
export function fmtUsd(v: number | undefined): string {
  if (v == null || !isFinite(v)) return '—';
  if (v >= 1) return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 }).replace(/0+$/, '').replace(/\.$/, '')}`;
}

export function fmtCoin(v: number | undefined): string {
  if (v == null || !isFinite(v)) return '—';
  const max = v >= 1 ? 4 : 8;
  return `${v.toLocaleString('en-US', { maximumFractionDigits: max })}`;
}

export function fmtAmount(n: number): string {
  return n.toLocaleString('en-US');
}

export function coinFor(symbol: string): Coin | undefined {
  return COINS.find((c) => c.symbol === symbol);
}
