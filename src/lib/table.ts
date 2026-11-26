import fs from 'node:fs';
import path from 'node:path';

export type Row = Record<string, string | number>;

function unquote(v: string): string {
  let s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

export function parseTable(raw: string): Omit<Row, 'serial'>[] {
  const rows: Record<string, string>[] = [];
  let current: Record<string, string> | null = null;
  const push = () => {
    if (current && String(current.name ?? '').trim()) rows.push(current);
    current = null;
  };

  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#') || /^rows\s*:/.test(line)) continue;
    const item = line.match(/^\s*-\s*(.*)$/);
    if (item) {
      push();
      current = {};
      const kv = item[1].match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
      if (kv) current[kv[1]] = unquote(kv[2]);
      continue;
    }
    if (!current) continue;
    const kv = line.match(/^\s+([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (kv) current[kv[1]] = unquote(kv[2]);
  }
  push();

  return rows.map((r) => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(r)) out[k] = String(v ?? '');
    return out;
  });
}

export function readTable(file: string): Row[] {
  try {
    const rows = parseTable(fs.readFileSync(file, 'utf-8'));
    return rows.map((r, i) => ({ serial: i + 1, ...r }));
  } catch {
    return [];
  }
}

export function cell(row: Row, key: string): string {
  const v = row[key];
  return v == null ? '' : String(v);
}

export function list(row: Row, key: string): string[] {
  return cell(row, key)
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

const dataDir = path.resolve(process.cwd(), 'src/data');

export function getSigcamp(): Row[] {
  return readTable(path.join(dataDir, 'sigcamp.yml'));
}

export function getCpuCoins(): Row[] {
  return readTable(path.join(dataDir, 'cpu-coins.yml'));
}
