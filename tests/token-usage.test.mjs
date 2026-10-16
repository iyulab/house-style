// House token usage — every `--hs-*` the sheets declare is read by a sheet (node --test, no dependencies).
//
// A house token nothing reads says something the theme does not do: `--hs-text-hero-size` was declared for KPI figures
// in 0.8.0 and no rule used it until 0.8.1, and `--hs-control-sm/md/lg` claimed to be «read by components.css» while the
// control heights came from the density padding formula (and the literals would have been wrong at any other density).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../styles/', import.meta.url));
const sheets = readdirSync(dir).filter((f) => f.endsWith('.css'))
  .map((f) => ({ f, text: readFileSync(dir + f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '') }));

const declared = new Set(sheets.flatMap(({ text }) => [...text.matchAll(/(--hs-[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
const isRead = (name) => sheets.some(({ text }) => text.includes(`var(${name})`) || text.includes(`var(${name},`));

test('the sheets declare house tokens (the scan found them)', () => {
  assert.ok(declared.size > 10, `found ${declared.size}`);
});

test('every declared --hs-* token is read by some rule', () => {
  const unread = [...declared].filter((n) => !isRead(n)).sort();
  assert.deepEqual(unread, [], `declared but never read: ${unread.join(', ')}`);
});
