// Control ladder — contract tests (node --test, no dependencies).
//
// Buttons and fields are 28 / 32 / 40 at the default control density (`--u-density` 14px), and the whole ladder is a
// function of that density: font sizes are density steps, paddings are em. So a host that raises the density (a field
// or touch mode) grows sm, md and lg together and in order. When the font sizes were literal (md 13px, lg 14px) and the
// components made sm follow the density, a raised density put sm above md (13.7 > 13px).
//
// Height = 1.5em line + 2 × block padding + 2px border (the components' formula). The browser measurement behind these
// numbers: 28 / 32 / 40 at 14px, and buttons and fields equal at every step at 16px.
//
// These tests read the declarations against a copy of the components' sm formula (`SM_FONT`). The rendered composition —
// the real components under this sheet, four densities, six controls — is `npm run check:ladder` (after a build).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (f) => readFileSync(fileURLToPath(new URL(`../styles/${f}`, import.meta.url)), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');
const components = read('components.css');
const tokens = read('tokens.css');

/** The declarations of the rule whose selector contains `selector` (first match). */
function rule(css, selector) {
  const at = css.indexOf(selector);
  assert.ok(at >= 0, `rule ${selector} exists`);
  const body = css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at));
  return Object.fromEntries([...body.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

/** Evaluates a length at a density: `var(--u-density, …)` → density px, `em` → × font px. */
function px(value, density, font) {
  const expr = value
    .replace(/var\(--u-density,\s*14px\)/g, String(density))
    .replace(/calc\(/g, '(')
    .replace(/(\d+(?:\.\d+)?)em/g, `($1*${font})`)
    .replace(/(\d+(?:\.\d+)?)px/g, '$1');
  assert.match(expr, /^[\d+\-*/(). ]+$/, `reduces to arithmetic: ${value}`);
  return Function(`return (${expr})`)();
}

const height = (font, pad) => 1.5 * font + 2 * pad + 2;
const SM_FONT = (d) => (d * 6) / 7; // the components' own sm size (no house font-size on sm)

const button = {
  sm: rule(components, "u-button[size='sm']"),
  md: rule(components, "u-button[size='md']"),
  lg: rule(components, "u-button[size='lg']"),
};
const field = {
  sm: rule(components, "u-date-range-picker)[size='sm']"),
  md: { '--u-field-padding-block': /--u-field-padding-block:\s*([^;]+);/.exec(tokens)?.[1].trim() },
  lg: rule(components, "u-date-range-picker)[size='lg']"),
};

function buttonSteps(d) {
  const fonts = { sm: SM_FONT(d), md: px(button.md['font-size'], d, 0), lg: px(button.lg['font-size'], d, 0) };
  return Object.fromEntries(Object.entries(fonts).map(([s, f]) => [s, height(f, px(button[s]['--btn-padding-block'], d, f))]));
}

function fieldSteps(d) {
  const fonts = { sm: SM_FONT(d), md: d, lg: px(field.lg['font-size'], d, 0) };
  const pad = { sm: field.sm['--u-field-padding-block'], md: field.md['--u-field-padding-block'], lg: field.lg['--u-field-padding-block'] };
  return Object.fromEntries(Object.entries(fonts).map(([s, f]) => [s, height(f, px(pad[s], d, f))]));
}

const round = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * 100) / 100]));

test('at the default density the ladder is 28 / 32 / 40 — buttons and fields alike', () => {
  assert.deepEqual(round(buttonSteps(14)), { sm: 28, md: 32, lg: 40 });
  assert.deepEqual(round(fieldSteps(14)), { sm: 28, md: 32, lg: 40 });
});

test('a raised density grows every step in order, and buttons stay level with fields', () => {
  const b = buttonSteps(16);
  const f = fieldSteps(16);
  assert.ok(b.sm < b.md && b.md < b.lg, `button order at 16px: ${JSON.stringify(round(b))}`);
  assert.ok(b.sm > 28 && b.md > 32 && b.lg > 40, 'every button step grows');
  assert.deepEqual(round(f), round(b));
});

test('no literal px font size or block padding is left on the control ladder', () => {
  for (const [s, r] of Object.entries(button)) {
    if (r['font-size']) assert.doesNotMatch(r['font-size'], /^\d/, `button ${s} font-size`);
    assert.doesNotMatch(r['--btn-padding-block'], /^\d/, `button ${s} padding`);
  }
  assert.doesNotMatch(field.md['--u-field-padding-block'], /^\d/, 'field md padding (tokens.css)');
});
