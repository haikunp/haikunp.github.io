import json
import time
import urllib.request
import urllib.parse

from . import config  # noqa: F401  (loads dotenv on import)

COINS = [
    {"symbol": "BTC", "name": "Bitcoin", "cg": "bitcoin", "cmc": 1},
    {"symbol": "ETH", "name": "Ethereum", "cg": "ethereum", "cmc": 1027},
    {"symbol": "TRX", "name": "TRON", "cg": "tron", "cmc": 1958},
    {"symbol": "USDT", "name": "Tether", "cg": "tether", "cmc": 825},
    {"symbol": "BNB", "name": "BNB", "cg": "binancecoin", "cmc": 1839},
]

UA = "MiniAdda-Dashboard/1.0"
_cache = {"ts": 0.0, "prices": {}, "source": None}


def _get(url, headers=None, timeout=10):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json", **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def _from_cmc_public():
    by_id = {c["cmc"]: c for c in COINS}
    out = {}
    start, limit = 1, 250
    for _ in range(5):
        url = ("https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?"
               + urllib.parse.urlencode({"start": start, "limit": limit, "sortBy": "market_cap", "sortType": "desc"}))
        data = _get(url)
        lst = data.get("data", {}).get("cryptoCurrencyList", [])
        if not lst:
            break
        for item in lst:
            c = by_id.get(item.get("id"))
            if not c:
                continue
            for q in item.get("quotes", []):
                if q.get("name") == "USD" or q.get("convert") == "USD":
                    out[c["symbol"]] = float(q["price"])
                    break
        if len(out) == len(COINS):
            break
        start += limit
    if not out:
        raise RuntimeError("cmc public empty")
    return out


def _from_coingecko():
    ids = ",".join(c["cg"] for c in COINS)
    url = "https://api.coingecko.com/api/v3/simple/price?" + urllib.parse.urlencode({"ids": ids, "vs_currencies": "usd"})
    data = _get(url)
    out = {}
    for c in COINS:
        e = data.get(c["cg"]) or {}
        if "usd" in e:
            out[c["symbol"]] = float(e["usd"])
    if not out:
        raise RuntimeError("coingecko empty")
    return out


def fetch_prices(force=False):
    now = time.time()
    if not force and _cache["prices"] and now - _cache["ts"] < 15:
        return dict(_cache["prices"]), _cache["source"]
    for name, fn in (("coinmarketcap", _from_cmc_public), ("coingecko", _from_coingecko)):
        try:
            p = fn()
            _cache.update(ts=now, prices=p, source=name)
            return p, name
        except Exception:
            continue
    if _cache["prices"]:
        return dict(_cache["prices"]), (_cache["source"] or "") + " (stale)"
    raise RuntimeError("all price sources failed")
