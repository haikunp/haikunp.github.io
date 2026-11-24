"""Read/write miniadda content (articles/news + Sigcamp row table).

Articles use one collection with a `kind` (news|article) and an `order` weight
that the dashboard can rearrange. Sigcamp is a flat list of rows kept in
src/data/sigcamp.yml so rows can be edited one at a time.
"""
import re
from pathlib import Path

from . import config

FRONT = re.compile(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", re.S)


def _parse_scalar(v):
    v = v.strip()
    if v == "" or v == "null" or v == "~":
        return None
    if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
        return v[1:-1]
    if v in ("true", "false"):
        return v == "true"
    if re.fullmatch(r"-?\d+", v):
        return int(v)
    if re.fullmatch(r"-?\d+\.\d+", v):
        return float(v)
    if v.startswith("[") and v.endswith("]"):
        inner = v[1:-1].strip()
        if not inner:
            return []
        return [_parse_scalar(x) for x in inner.split(",")]
    return v


def _parse_frontmatter(text):
    m = FRONT.match(text)
    if not m:
        return {}, text
    fm_raw, body = m.group(1), m.group(2)
    data = {}
    lines = fm_raw.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip() or line.lstrip().startswith("#"):
            i += 1
            continue
        if ":" in line and not line.startswith(" "):
            key, _, rest = line.partition(":")
            key = key.strip()
            rest = rest.strip()
            if rest == "":
                # block value: list of scalars or list of dicts (e.g. sources)
                block = []
                j = i + 1
                while j < len(lines) and (lines[j].startswith(" ") or lines[j].strip() == ""):
                    block.append(lines[j])
                    j += 1
                block = [b for b in block if b.strip()]
                if block and block[0].strip().startswith("- "):
                    if ":" in block[0].strip()[2:]:
                        # list of dicts: each "- key: value" starts a new item,
                        # deeper-indented "key: value" lines continue it
                        items = []
                        cur = {}
                        for b in block:
                            raw = b.rstrip()
                            is_item = raw.lstrip().startswith("- ")
                            line2 = raw.lstrip()[2:] if is_item else raw.strip()
                            if ":" not in line2:
                                continue
                            k2, _, v2 = line2.partition(":")
                            k2, v2 = k2.strip(), v2.strip()
                            if is_item and cur:
                                items.append(cur)
                                cur = {}
                            cur[k2] = _parse_scalar(v2)
                        if cur:
                            items.append(cur)
                        data[key] = items
                    else:
                        data[key] = [_parse_scalar(b.strip()[2:]) for b in block if b.strip().startswith("- ")]
                    i = j
                    continue
                data[key] = None
                i += 1
                continue
            data[key] = _parse_scalar(rest)
        i += 1
    return data, body


def _yaml_scalar(v):
    if v is None:
        return ""
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    s = str(v)
    if any(c in s for c in ':#"{}\n[]') or s.strip() != s:
        s = s.replace('"', '\\"')
        return f'"{s}"'
    return s


def _dump_frontmatter(data, body):
    order = ["title", "kind", "answer", "topic", "order", "description", "seoTitle",
             "seoDescription", "featuredImage", "featuredImageAlt", "sources", "author",
             "publishedAt", "updatedAt", "lastVerified", "featured", "trending"]
    keys = [k for k in order if k in data] + [k for k in data if k not in order]
    lines = ["---"]
    for k in keys:
        v = data[k]
        if isinstance(v, list):
            if all(isinstance(x, dict) for x in v) and v:
                lines.append(f"{k}:")
                for item in v:
                    first = True
                    for ik, iv in item.items():
                        prefix = "  - " if first else "    "
                        lines.append(f"{prefix}{ik}: {_yaml_scalar(iv)}")
                        first = False
            elif v:
                lines.append(f"{k}:")
                for x in v:
                    lines.append(f"  - {_yaml_scalar(x)}")
            else:
                lines.append(f"{k}: []")
        elif v is None:
            continue
        else:
            lines.append(f"{k}: {_yaml_scalar(v)}")
    lines.append("---")
    return "\n".join(lines) + "\n\n" + (body or "").strip() + "\n"


def _slug(s):
    s = str(s).lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")[:80]


def _read_dir(dirpath):
    out = []
    for p in sorted(dirpath.glob("*.md")):
        text = p.read_text(encoding="utf-8")
        data, body = _parse_frontmatter(text)
        out.append({"id": p.stem, "data": data, "body": body, "path": str(p)})
    return out


# ---------- articles / news ----------
def list_articles():
    config.ensure_dirs()
    items = _read_dir(config.ARTICLES)
    # Manual order first, then newest published date.
    def key(a):
        d = a["data"]
        order = d.get("order")
        order = order if isinstance(order, int) else 0
        return (order, str(d.get("publishedAt") or ""))
    items.sort(key=key)
    return items


def get_article(slug):
    p = config.ARTICLES / f"{slug}.md"
    if not p.exists():
        return None
    data, body = _parse_frontmatter(p.read_text(encoding="utf-8"))
    return {"id": slug, "data": data, "body": body}


def save_article(slug, data, body, old_slug=None):
    config.ensure_dirs()
    slug = _slug(slug or data.get("title", ""))
    data = dict(data)
    data.setdefault("publishedAt", __import__("datetime").date.today().isoformat())
    data.setdefault("author", "MiniAdda Editorial")
    data.setdefault("kind", "news")
    if data.get("kind") not in ("news", "article"):
        data["kind"] = "news"
    if not isinstance(data.get("order"), int):
        data["order"] = 0
    text = _dump_frontmatter(data, body)
    target = config.ARTICLES / f"{slug}.md"
    if old_slug and old_slug != slug:
        old = config.ARTICLES / f"{_slug(old_slug)}.md"
        if old.exists():
            old.unlink()
    target.write_text(text, encoding="utf-8")
    return slug, text


def delete_article(slug):
    p = config.ARTICLES / f"{_slug(slug)}.md"
    if p.exists():
        p.unlink()
        return True
    return False


def reorder_articles(ids):
    """Assign sequential `order` values following the given slug list."""
    for idx, slug in enumerate(ids):
        a = get_article(_slug(slug))
        if not a:
            continue
        data, body = _parse_frontmatter((config.ARTICLES / f"{_slug(slug)}.md").read_text(encoding="utf-8"))
        data["order"] = idx
        (config.ARTICLES / f"{_slug(slug)}.md").write_text(_dump_frontmatter(data, body), encoding="utf-8")
    return True


def article_repo_path(slug):
    return f"src/content/articles/{_slug(slug)}.md"


# ---------- sigcamp rows (src/data/sigcamp.yml) ----------
_YAML_FIELDS = ("name", "manager", "payment", "link")


def _yaml_str(v):
    s = str(v or "").replace("\n", " ").strip()
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def list_sigcamp():
    config.ensure_dirs()
    if not config.SIGCAMP_FILE.exists():
        return []
    rows = []
    current = None
    for line in config.SIGCAMP_FILE.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.strip().startswith("#") or re.match(r"^rows\s*:", line):
            continue
        item = re.match(r"^\s*-\s*(.*)$", line)
        if item:
            if current is not None:
                rows.append(current)
            current = {k: "" for k in _YAML_FIELDS}
            kv = re.match(r"^([A-Za-z0-9_]+)\s*:\s*(.*)$", item.group(1))
            if kv:
                current[kv.group(1)] = _unquote_yaml(kv.group(2))
            continue
        if current is None:
            continue
        kv = re.match(r"^\s+([A-Za-z0-9_]+)\s*:\s*(.*)$", line)
        if kv:
            current[kv.group(1)] = _unquote_yaml(kv.group(2))
    if current is not None:
        rows.append(current)
    rows = [r for r in rows if str(r.get("name", "")).strip()]
    for i, r in enumerate(rows):
        r["serial"] = i + 1
    return rows


def _unquote_yaml(v):
    s = v.strip()
    if len(s) >= 2 and s[0] == '"' and s[-1] == '"':
        s = s[1:-1].replace('\\"', '"').replace("\\\\", "\\")
    elif len(s) >= 2 and s[0] == "'" and s[-1] == "'":
        s = s[1:-1]
    return s


def save_sigcamp(rows):
    config.ensure_dirs()
    clean = []
    for r in rows or []:
        name = str(r.get("name", "")).strip()
        if not name:
            continue
        clean.append({
            "name": name,
            "manager": str(r.get("manager", "")).strip(),
            "payment": str(r.get("payment", "")).strip(),
            "link": str(r.get("link", "")).strip(),
        })
    lines = ["# Sigcamp rows — edited by the dashboard. Serial = row position.", "rows:"]
    for r in clean:
        lines.append(f"  - name: {_yaml_str(r['name'])}")
        lines.append(f"    manager: {_yaml_str(r['manager'])}")
        lines.append(f"    payment: {_yaml_str(r['payment'])}")
        lines.append(f"    link: {_yaml_str(r['link'])}")
    if len(lines) == 2:
        lines[1] = "rows: []"
    config.SIGCAMP_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return clean


def sigcamp_repo_path():
    return "src/data/sigcamp.yml"
