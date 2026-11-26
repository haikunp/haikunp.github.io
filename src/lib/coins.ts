// Coin catalogue for the Crypto Price tool.
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
  { symbol: 'USDT', name: 'Tether', cg: 'tether', cmc: 825 },
  { symbol: 'BNB', name: 'BNB', cg: 'binancecoin', cmc: 1839 },
  { symbol: 'SOL', name: 'Solana', cg: 'solana', cmc: 5426 },
  { symbol: 'XRP', name: 'XRP', cg: 'ripple', cmc: 52 },
  { symbol: 'USDC', name: 'USD Coin', cg: 'usd-coin', cmc: 3408 },
  { symbol: 'ADA', name: 'Cardano', cg: 'cardano', cmc: 2010 },
  { symbol: 'DOGE', name: 'Dogecoin', cg: 'dogecoin', cmc: 74 },
  { symbol: 'TRX', name: 'TRON', cg: 'tron', cmc: 1958 },
  { symbol: 'AVAX', name: 'Avalanche', cg: 'avalanche-2', cmc: 5805 },
  { symbol: 'LINK', name: 'Chainlink', cg: 'chainlink', cmc: 1975 },
  { symbol: 'DOT', name: 'Polkadot', cg: 'polkadot', cmc: 6636 },
  { symbol: 'MATIC', name: 'Polygon', cg: 'matic-network', cmc: 3890 },
  { symbol: 'LTC', name: 'Litecoin', cg: 'litecoin', cmc: 2 },
  { symbol: 'BCH', name: 'Bitcoin Cash', cg: 'bitcoin-cash', cmc: 1831 },
  { symbol: 'TON', name: 'Toncoin', cg: 'the-open-network', cmc: 11419 },
  { symbol: 'SHIB', name: 'Shiba Inu', cg: 'shiba-inu', cmc: 5994 },
  { symbol: 'XLM', name: 'Stellar', cg: 'stellar', cmc: 512 },
  { symbol: 'ATOM', name: 'Cosmos', cg: 'cosmos', cmc: 3794 },
  { symbol: 'ETC', name: 'Ethereum Classic', cg: 'ethereum-classic', cmc: 1321 },
  { symbol: 'UNI', name: 'Uniswap', cg: 'uniswap', cmc: 7083 },
  { symbol: 'NEAR', name: 'NEAR Protocol', cg: 'near', cmc: 6535 },
  { symbol: 'APT', name: 'Aptos', cg: 'aptos', cmc: 21794 },
  { symbol: 'ARB', name: 'Arbitrum', cg: 'arbitrum', cmc: 11841 },
  { symbol: 'OP', name: 'Optimism', cg: 'optimism', cmc: 11840 },
  { symbol: 'FIL', name: 'Filecoin', cg: 'filecoin', cmc: 2280 },
  { symbol: 'HBAR', name: 'Hedera', cg: 'hedera-hashgraph', cmc: 4642 },
  { symbol: 'ICP', name: 'Internet Computer', cg: 'internet-computer', cmc: 8916 },
  { symbol: 'VET', name: 'VeChain', cg: 'vechain', cmc: 3077 },
];

export function coinBySymbol(symbol: string): Coin | undefined {
  return COINS.find((c) => c.symbol.toLowerCase() === symbol.toLowerCase());
}

// Slug used in auto-generated conversion pages: full name, e.g. "tron", "bitcoin".
export function coinSlug(coin: Coin): string {
  return coin.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Amounts offered as long-tail "<amount>-<coin>-to-usd" pages. Kept small so
// the static build stays light; covers the most-searched values.
export const CONVERSION_AMOUNTS = [1, 10, 100, 1000, '0.0001', '0.001', '0.01', '0.1'];

// Fallback metadata for coins that appear in a price feed but are not in the
// curated catalogue (so the table never skips a coin).
export function coinFromSymbol(symbol: string): Coin {
  const known = coinBySymbol(symbol);
  if (known) return known;
  return { symbol, name: symbol, cg: '', cmc: 0 };
}
