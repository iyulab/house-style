// House recipes — contract tests (node --test, no dependencies).
//
// ⑴ A plain link takes the house link colour, at zero specificity — a class on the link and any
//   application rule still win.
// ⑵ Links the patterns style as something else (a card, a tab) do not inherit the link look.
// ⑶ A table's totals are separated from the body by one line, not one per totals row.
// ⑷ The list page's filters row keeps the page's bottom alignment.
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

test('one line separates the totals from the body', () => {
  assert.equal(rule(patterns, '.hs-table tfoot td')?.has('border-top'), false,
    'every totals row would get the line');
  assert.equal(rule(patterns, '.hs-table tfoot tr:first-child td')?.get('border-top'),
    '1px solid var(--u-border-color)');
});

test('a small tag stays an 18px mark under the house tag padding', () => {
  assert.equal(rule(components, 'u-tag')?.get('--tag-padding-block'), '1px');
  assert.equal(rule(components, "u-tag[size='sm']")?.get('--tag-padding-block'), '0',
    'the house padding on every tag would make the small step 20px');
});

test('tabs draw the current tab in the preset tab colour (accent ink · ink under warm)', () => {
  assert.equal(rule(components, 'u-tab-nav')?.get('--tab-nav-color'), 'var(--hs-tab-current-color)');
  assert.equal(rule(components, 'u-tab-panel')?.get('--tab-panel-color'), 'var(--hs-tab-current-color)');
  assert.equal(rule(components, ':is(u-tab-nav, u-tab-panel) u-tab[active]')?.get('font-weight'), '600');
});

test('a tag is a pill', () => {
  assert.equal(rule(components, 'u-tag')?.get('border-radius'), 'var(--u-radius-pill, 9999px)');
});

test('the contrast preset re-scopes the neutral roles inside the sidebar to the shell', () => {
  const shell = rule(components, ":root[hs-palette='contrast'] u-sidebar-layout::part(sidebar)");
  assert.ok(shell, 'components.css scopes the shell');
  for (const role of ['--u-bg-color', '--u-txt-color', '--u-txt-color-weak', '--u-bg-color-hover', '--u-border-color']) {
    assert.match(shell.get(role) ?? '', /^var\(--hs-shell-/, role);
  }
});

test('an inline alert puts its actions in a right-hand column', () => {
  assert.equal(rule(components, 'u-alert[inline]::part(container)')?.get('display'), 'grid');
  const footer = rule(components, 'u-alert[inline]::part(footer)');
  assert.equal(footer?.get('grid-column'), '2');
  assert.equal(footer?.get('grid-row'), '1 / span 2');
});

test('the 0.4.0 deprecations are gone', () => {
  for (const cls of ['.hs-page-head', '.hs-kbd', '.hs-stats', '.hs-stat', '.hs-sheet-footer']) {
    assert.equal(rule(patterns, cls), undefined, `${cls} was removed in 0.5.0`);
  }
});

// ⑷ The list page's filters row keeps the page's own bottom alignment — a field with a visible label stays level with
//   the buttons beside it. Centring it put a button level with the middle of «label + field», about 10px above the field.
test('the list page filters row does not override the page alignment', () => {
  const filters = rule(components, 'u-list-page::part(filters)');
  assert.ok(filters, 'components.css styles the filters row');
  assert.equal(filters.has('align-items'), false, 'the page aligns the row to the bottom (`flex-end`)');
});
