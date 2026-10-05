// House recipes — contract tests (node --test, no dependencies).
//
// ⑴ A plain link takes the house link colour, at zero specificity — a class on the link and any
//   application rule still win.
// ⑵ Links the patterns style as something else (a card, a tab) do not inherit the link look.
// ⑶ A table's totals are separated from the body by one line, not one per totals row.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = name => readFileSync(fileURLToPath(new URL(`../styles/${name}`, import.meta.url)), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

/** Declarations of the first rule whose selector list is exactly `selector`. */
function rule(source, selector) {
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(source))) {
    if (m[1].trim().replace(/\s+/g, ' ') === selector) {
      const map = new Map();
      for (const d of m[2].matchAll(/([\w-]+)\s*:\s*([^;]+);/g)) map.set(d[1], d[2].trim());
      return map;
    }
  }
  return undefined;
}

const components = read('components.css');
const patterns = read('patterns.css');

test('a plain link takes the house link colour at zero specificity', () => {
  const link = rule(components, ':where(a:any-link)');
  assert.ok(link, 'components.css has a `:where(a:any-link)` rule');
  assert.equal(link.get('color'), 'var(--u-link-txt-color)');
});

test('a whole card as a link reads as a card, and a tab link has no underline', () => {
  const card = rule(patterns, 'a.hs-card');
  assert.equal(card?.get('color'), 'inherit');
  assert.equal(card?.get('text-decoration'), 'none');
  assert.equal(rule(patterns, '.hs-views__tab')?.get('text-decoration'), 'none');
});

test('one line separates the totals from the body', () => {
  assert.equal(rule(patterns, '.hs-table tfoot td')?.has('border-top'), false,
    'every totals row would get the line');
  assert.equal(rule(patterns, '.hs-table tfoot tr:first-child td')?.get('border-top'),
    '1px solid var(--u-border-color)');
});
