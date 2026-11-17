"""Read/write miniadda markdown content (articles + sigcamp) with YAML frontmatter."""
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
                            line = raw.lstrip()[2:] if is_item else raw.strip()
                            if ":" not in line:
                                continue
                            k2, _, v2 = line.partition(":")
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
    order = ["title", "answer", "project", "status", "reward", "slots", "section", "topic",
             "tags", "description", "seoTitle", "seoDescription", "featuredImage",
             "featuredImageAlt", "sources", "author", "publishedAt", "updatedAt",
             "lastVerified", "startedAt", "threadUrl", "featured", "trending"]
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


# ---------- articles ----------
def list_articles():
    config.ensure_dirs()
    return _read_dir(config.ARTICLES)


def get_article(slug):
    p = config.ARTICLES / f"{slug}.md"
    if not p.exists():
        return None
    data, body = _parse_frontmatter(p.read_text(encoding="utf-8"))
    return {"id": slug, "data": data, "body": body}


def save_article(slug, data, body):
    config.ensure_dirs()
    slug = _slug(slug or data.get("title", ""))
    data = dict(data)
    data.setdefault("publishedAt", __import__("datetime").date.today().isoformat())
    data.setdefault("author", "MiniAdda Editorial")
    text = _dump_frontmatter(data, body)
    (config.ARTICLES / f"{slug}.md").write_text(text, encoding="utf-8")
    return slug, text


def delete_article(slug):
    p = config.ARTICLES / f"{_slug(slug)}.md"
    if p.exists():
        p.unlink()
        return True
    return False


# ---------- sigcamp ----------
def list_sigcamp():
    config.ensure_dirs()
    return _read_dir(config.SIGCAMP)


def get_sigcamp(slug):
    p = config.SIGCAMP / f"{slug}.md"
    if not p.exists():
        return None
    data, body = _parse_frontmatter(p.read_text(encoding="utf-8"))
    return {"id": slug, "data": data, "body": body}


def save_sigcamp(slug, data, body):
    config.ensure_dirs()
    slug = _slug(slug or data.get("project", ""))
    data = dict(data)
    data.setdefault("status", "active")
    text = _dump_frontmatter(data, body)
    (config.SIGCAMP / f"{slug}.md").write_text(text, encoding="utf-8")
    return slug, text


def delete_sigcamp(slug):
    p = config.SIGCAMP / f"{_slug(slug)}.md"
    if p.exists():
        p.unlink()
        return True
    return False


def article_repo_path(slug):
    return f"src/content/articles/{_slug(slug)}.md"


def sigcamp_repo_path(slug):
    return f"src/content/sigcamp/{_slug(slug)}.md"
