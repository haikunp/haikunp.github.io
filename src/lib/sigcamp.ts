// Sigcamp table rows live in a single YAML file (src/data/sigcamp.yml) so the
// dashboard can edit them one row at a time. The serial number is the row
// position (1-based). Parsed with a tiny purpose-built reader for the flat
// `rows: [{ name, manager, payment, link }]` shape — no extra dependency.
import fs from 'node:fs';
import path from 'node:path';

export interface SigcampRow {
  serial: number;
  name: string;
  manager: string;
  payment: string;
  link: string;
}

export const SIGCAMP_FILE = path.resolve(process.cwd(), 'src/data/sigcamp.yml');

function unquote(v: string): string {
  let s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.replace(/\\"/g, '"');
}

export function parseSigcamp(raw: string): SigcampRow[] {
  const rows: Omit<SigcampRow, 'serial'>[] = [];
  let current: Record<string, string> | null = null;
  const push = () => {
    if (current && String(current.name ?? '').trim()) {
      rows.push({
        name: String(current.name ?? '').trim(),
        manager: String(current.manager ?? '').trim(),
        payment: String(current.payment ?? '').trim(),
        link: String(current.link ?? '').trim(),
      });
    }
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

  return rows.map((r, i) => ({ serial: i + 1, ...r }));
}

export function readSigcamp(): SigcampRow[] {
  try {
    return parseSigcamp(fs.readFileSync(SIGCAMP_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function getSigcamp(): SigcampRow[] {
  return readSigcamp();
}
