// MiniAdda live price feed. One cached upstream call serves all visitors.
const COINS = [
  { symbol: 'BTC', cg: 'bitcoin', cmc: 1 },
  { symbol: 'ETH', cg: 'ethereum', cmc: 1027 },
  { symbol: 'TRX', cg: 'tron', cmc: 1958 },
  { symbol: 'USDT', cg: 'tether', cmc: 825 },
  { symbol: 'BNB', cg: 'binancecoin', cmc: 1839 },
];

const CACHE_TTL_SECONDS = 15;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

let memCache = { ts: 0, body: null };

async function getJson(url, headers) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'MiniAdda-Worker/1.0', ...(headers || {}) },
  });
  if (!res.ok) throw new Error('upstream ' + res.status + ' ' + url);
  return res.json();
}

async function fromCoinMarketCap(env) {
  const key = env.CMC_API_KEY || '';
  const out = {};
  if (key) {
    const ids = COINS.map((c) => c.cmc).join(',');
    const data = await getJson(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=' +
        encodeURIComponent(ids) + '&convert=USD',
      { 'X-CMC_PRO_API_KEY': key, Accept: 'application/json' }
    );
    for (const c of COINS) {
      const item = data.data && data.data[String(c.cmc)];
      if (item) out[c.symbol] = Number(item.quote.USD.price);
    }
    if (Object.keys(out).length) return out;
    throw new Error('cmc empty');
  }
  let start = 1;
  const limit = 250;
  for (let page = 0; page < 5; page++) {
    const data = await getJson(
      'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=' +
        start + '&limit=' + limit + '&sortBy=market_cap&sortType=desc',
      { Accept: 'application/json' }
    );
    const list = (data.data && data.data.cryptoCurrencyList) || [];
    if (!list.length) break;
    for (const item of list) {
      const coin = COINS.find((c) => c.cmc === item.id);
      if (!coin) continue;
      const q = (item.quotes || []).find((x) => x.name === 'USD' || x.convert === 'USD');
      if (q) out[coin.symbol] = Number(q.price);
    }
    if (Object.keys(out).length === COINS.length) break;
    start += limit;
  }
  if (!Object.keys(out).length) throw new Error('cmc empty');
  return out;
}

async function fromCoinGecko() {
  const ids = COINS.map((c) => c.cg).join(',');
  const data = await getJson(
    'https://api.coingecko.com/api/v3/simple/price?ids=' + encodeURIComponent(ids) + '&vs_currencies=usd'
  );
  const out = {};
  for (const c of COINS) {
    const e = data[c.cg];
    if (e && e.usd != null) out[c.symbol] = Number(e.usd);
  }
  if (!Object.keys(out).length) throw new Error('cg empty');
  return out;
}

async function buildPrices(env) {
  try {
    return { prices: await fromCoinMarketCap(env), source: 'coinmarketcap' };
  } catch (e) {
    return { prices: await fromCoinGecko(), source: 'coingecko' };
  }
}

function jsonResponse(body, status) {
  return new Response(body, {
    status: status || 200,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=' + CACHE_TTL_SECONDS,
    },
  });
}

async function handle(request, env, ctx) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: CORS });

  const url = new URL(request.url);
  if (url.pathname === '/health') return new Response('ok', { headers: CORS });

  const nowSec = Math.floor(Date.now() / 1000);
  if (memCache.body && nowSec - memCache.ts < CACHE_TTL_SECONDS) {
    return jsonResponse(memCache.body);
  }

  const cache = caches.default;
  const cacheKey = new Request('https://miniadda-prices.internal/prices.json', { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) {
    const body = await cached.text();
    memCache = { ts: nowSec, body };
    return jsonResponse(body);
  }

  try {
    const data = await buildPrices(env);
    const payload = JSON.stringify({ prices: data.prices, source: data.source, ts: new Date().toISOString() });
    ctx.waitUntil(
      cache.put(cacheKey, new Response(payload, {
        headers: { 'Cache-Control': 'public, max-age=' + CACHE_TTL_SECONDS },
      }))
    );
    memCache = { ts: nowSec, body: payload };
    return jsonResponse(payload);
  } catch (e) {
    if (memCache.body) return jsonResponse(memCache.body);
    return jsonResponse(JSON.stringify({ error: String(e) }), 502);
  }
}

export default {
  async fetch(request, env, ctx) {
    return handle(request, env, ctx);
  },
};
