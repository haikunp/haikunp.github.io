import { COINS, type Coin } from './coins';

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
  for (let page = 0; page < 5; page++) {
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

// Fetch prices at build time. Tries CMC public listing first, CoinGecko fallback.
// Never throws: on total failure returns an empty map so the build still succeeds.
export async function fetchPrices(): Promise<{ prices: PriceMap; source: string }> {
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
