"""Read/write the two dashboard-managed tables.

Both are flat row lists stored in src/data/ so rows can be edited one at a time
and reordered by position:

    src/data/sigcamp.yml   — BitcoinTalk signature campaigns
    src/data/cpu-coins.yml — CPU-mineable coins

Serial is derived from row position (1-based) on read.
"""
import re

from . import config

# Field order per table. The dashboard renders these columns and only these
# keys are written back.
TABLES = {
    "sigcamp": {
        "file": config.SIGCAMP_FILE,
        "fields": ("name", "subtitle", "coin", "slots", "payment", "status", "link"),
    },
    "cpu": {
        "file": config.CPU_FILE,
        "fields": ("name", "symbol", "algorithm", "pool", "exchange"),
    },
}


TABLES_TITLES = {
    "sigcamp": "Sigcamp rows — edited by the dashboard. Serial = row position.",
    "cpu": "CPU-mineable coins — edited by the dashboard. Serial = row position.",
}


def _unquote(v):
    s = (v or "").strip()
    if len(s) >= 2 and s[0] == '"' and s[-1] == '"':
        s = s[1:-1].replace('\\"', '"').replace("\\\\", "\\")
    elif len(s) >= 2 and s[0] == "'" and s[-1] == "'":
        s = s[1:-1]
    return s


def _yaml_str(v):
    s = str(v or "").replace("\n", " ").strip()
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def _field(name):
    table = TABLES.get(name)
    if not table:
        raise KeyError(f"unknown table: {name}")
    return table


def list_rows(name):
    table = _field(name)
    config.ensure_dirs()
    path = table["file"]
    if not path.exists():
        return []
    fields = table["fields"]
    rows = []
    current = None
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.strip().startswith("#") or re.match(r"^rows\s*:", line):
            continue
        item = re.match(r"^\s*-\s*(.*)$", line)
        if item:
            if current is not None:
                rows.append(current)
            current = {k: "" for k in fields}
            kv = re.match(r"^([A-Za-z0-9_]+)\s*:\s*(.*)$", item.group(1))
            if kv and kv.group(1) in current:
                current[kv.group(1)] = _unquote(kv.group(2))
            continue
        if current is None:
            continue
        kv = re.match(r"^\s+([A-Za-z0-9_]+)\s*:\s*(.*)$", line)
        if kv and kv.group(1) in current:
            current[kv.group(1)] = _unquote(kv.group(2))
    if current is not None:
        rows.append(current)
    rows = [r for r in rows if str(r.get("name", "")).strip()]
    for i, r in enumerate(rows):
        r["serial"] = i + 1
    return rows


def save_rows(name, rows):
    table = _field(name)
    config.ensure_dirs()
    fields = table["fields"]
    clean = []
    for r in rows or []:
        if not str(r.get("name", "")).strip():
            continue
        clean.append({k: str(r.get(k, "")).strip() for k in fields})
    lines = [f"# {TABLES_TITLES[name]}", "rows:"]
    for r in clean:
        first = True
        for k in fields:
            prefix = "  - " if first else "    "
            lines.append(f"{prefix}{k}: {_yaml_str(r[k])}")
            first = False
    if len(lines) == 2:
        lines[1] = "rows: []"
    table["file"].write_text("\n".join(lines) + "\n", encoding="utf-8")
    return list_rows(name)


def repo_path(name):
    rel = _field(name)["file"].relative_to(config.ROOT)
    return str(rel).replace("\\", "/")
