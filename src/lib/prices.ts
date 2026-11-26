export type PriceMap = Record<string, number>;

export interface LiveCoin {
  symbol: string;
  name: string;
  cmc: number;
  slug: string;
  price: number;
}

export interface PriceResult {
  prices: PriceMap;
  coins: LiveCoin[];
  source: string;
}

const UA = 'MiniAdda/1.0 (+https://miniadda.com)';
const MAX_PAGES = 4;
const PAGE_LIMIT = 250;

async function getJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fromCoinMarketCap(): Promise<LiveCoin[]> {
  const out: LiveCoin[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const start = 1 + page * PAGE_LIMIT;
    const data = await getJson(
      `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=${start}&limit=${PAGE_LIMIT}&sortBy=market_cap&sortType=desc`
    );
    const list = data?.data?.cryptoCurrencyList ?? [];
    if (!list.length) break;
    for (const item of list) {
      const q = (item.quotes ?? []).find((x: any) => x.name === 'USD' || x.convert === 'USD');
      const price = q ? Number(q.price) : NaN;
      if (!item.symbol || !isFinite(price)) continue;
      out.push({
        symbol: String(item.symbol),
        name: String(item.name ?? item.symbol),
        cmc: Number(item.id),
        slug: String(item.slug ?? ''),
        price,
      });
    }
    if (list.length < PAGE_LIMIT) break;
  }
  return out;
}

async function fromCoinGecko(): Promise<LiveCoin[]> {
  const out: LiveCoin[] = [];
  for (let page = 1; page <= 10; page++) {
    const data = await getJson(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=${page}&sparkline=false`
    );
    if (!Array.isArray(data) || !data.length) break;
    for (const item of data) {
      const price = Number(item.current_price);
      if (!item.symbol || !isFinite(price)) continue;
      out.push({
        symbol: String(item.symbol).toUpperCase(),
        name: String(item.name ?? item.symbol),
        cmc: 0,
        slug: String(item.id ?? ''),
        price,
      });
    }
    if (data.length < 100) break;
  }
  return out;
}

let pricePromise: Promise<PriceResult> | null = null;

export function fetchPrices(): Promise<PriceResult> {
  if (!pricePromise) pricePromise = loadPrices();
  return pricePromise;
}

async function loadPrices(): Promise<PriceResult> {
  let coins: LiveCoin[] = [];
  let source = 'unavailable';
  try {
    coins = await fromCoinMarketCap();
    if (coins.length) source = 'coinmarketcap';
  } catch {
    coins = [];
  }
  if (!coins.length) {
    try {
      coins = await fromCoinGecko();
      if (coins.length) source = 'coingecko';
    } catch {
      coins = [];
    }
  }
  const prices: PriceMap = {};
  const seen = new Set<string>();
  const unique: LiveCoin[] = [];
  for (const c of coins) {
    const key = c.symbol.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    prices[c.symbol] = c.price;
    unique.push(c);
  }
  return { prices, coins: unique, source };
}

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
