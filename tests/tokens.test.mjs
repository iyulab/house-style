// House tokens — contract tests (node --test, no dependencies).
//
// ⑴ Every colour the light block sets is also set by the dark block. The house layer sits
//   above the built-in defaults, so a light value the dark block forgets beats the built-in
//   dark value — it leaks into dark mode silently.
// ⑵ Contrast floors for the pairs the theme promises (WCAG 2.x relative luminance).
// ⑵′ Perception floors for state and depth steps (OKLab lightness difference) — a quiet theme
//    must still let a hover, a press, a selection and a surface step be seen.
// ⑶ The sheet declares the shared layer order and keeps everything inside `iyu.house`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('../styles/tokens.css', import.meta.url)), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

/** Top-level rule bodies inside the layer, keyed by selector (first occurrence of each). */
function blocks(source) {
  const inner = source.slice(source.indexOf('@layer iyu.house {') + '@layer iyu.house {'.length);
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(inner))) out.push({ selector: m[1].trim(), body: m[2] });
  return out;
}
function decls(body) {
  const map = new Map();
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map.set(m[1], m[2].trim());
  return map;
}

const all = blocks(css);
const light = decls(all.find(b => b.selector === ':root').body);
const dark = decls(all.find(b => b.selector === ':root[theme="dark"]').body);
const scale = decls(all.filter(b => b.selector === ':root').slice(1).map(b => b.body).join('\n'));

const isLiteralColour = v => /^#|^rgba?\(/.test(v);

test('the sheet declares the shared layer order and wraps everything in iyu.house', () => {
  assert.match(css, /^\s*@layer iyu\.base, iyu\.house;/m);
  assert.equal(css.match(/@layer iyu\.house \{/g)?.length, 1);
});

test('🔴every literal colour set in light is also set in dark (no light value leaks into dark)', () => {
  const missing = [...light].filter(([k, v]) => isLiteralColour(v) && !dark.has(k)).map(([k]) => k);
  assert.deepEqual(missing, []);
});

test('the scale block holds no colours (shape and type are mode-independent)', () => {
  const colours = [...scale].filter(([, v]) => isLiteralColour(v)).map(([k]) => k);
  assert.deepEqual(colours, []);
});

// ── contrast ──────────────────────────────────────────────────────────────
function rgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
}
function luminance(hex) {
  const [r, g, b] = rgb(hex).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const TEXT = 4.5;
const GRAPHIC = 3;
/** [foreground token, background token, floor] — what the theme promises in both modes. */
const PAIRS = [
  ['--u-txt-color', '--u-bg-color', TEXT],
  ['--u-txt-color', '--u-canvas-bg-color', TEXT],
  ['--u-txt-color-weak', '--u-bg-color', TEXT],
  ['--u-txt-color-weak', '--u-canvas-bg-color', TEXT],
  ['--u-txt-color-weak', '--u-bg-color-raised', TEXT],
  ['--u-txt-color-weaker', '--u-bg-color', TEXT],
  ['--u-txt-color-weaker', '--u-canvas-bg-color', TEXT],
  ['--u-link-txt-color', '--u-bg-color', TEXT],
  ['--u-primary-txt-color', '--u-primary-color', TEXT],
  ['--u-txt-color', '--u-primary-bg-color', TEXT],
  ['--u-input-border-color', '--u-bg-color', GRAPHIC],
  ['--u-focus-ring-color', '--u-bg-color', GRAPHIC],
  ['--u-focus-ring-color', '--u-canvas-bg-color', GRAPHIC],
  ['--hs-brand-ink', '--hs-brand-soft', TEXT],
  ...['info', 'success', 'warning', 'danger'].flatMap(r => [
    [`--u-${r}-color-strong`, `--u-${r}-bg-color`, TEXT],
    [`--u-${r}-color-strong`, '--u-bg-color', TEXT],
    [`--u-${r}-txt-color`, `--u-${r}-color`, TEXT],
  ]),
];

// ── perception of state and depth (OKLab L) ─────────────────────────────
// WCAG ratios are for text and graphics; neighbouring surfaces differ by far less, and the ratio's
// flare term flattens dark ones. OKLab lightness is perceptually even across light and dark.
function oklabL(hex) {
  const [r, g, b] = rgb(hex).map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  return 0.2104542553 * Math.cbrt(l) + 0.793617785 * Math.cbrt(m) - 0.0040720468 * Math.cbrt(s);
}
/** Floors (|ΔL|): a hover step, a press step, a selection against its surface, a depth step. */
const HOVER = 0.03;
const PRESS = 0.05;
const SELECTED = 0.03;
/** Depth steps also carry a hairline edge (cards, tables), so the fill difference can be smaller. */
const DEPTH = 0.025;
const STEPS = [
  ['--u-bg-color-hover', '--u-bg-color', HOVER],
  ['--u-bg-color-active', '--u-bg-color', PRESS],
  ['--u-bg-color-raised-hover', '--u-bg-color-raised', HOVER],
  ['--u-primary-bg-color', '--u-bg-color', SELECTED],
  ['--u-bg-color', '--u-canvas-bg-color', DEPTH],
  ['--u-bg-color-raised', '--u-bg-color', DEPTH],
];

for (const [mode, map] of [['light', light], ['dark', new Map([...light, ...dark])]]) {
  for (const [a, b, floor] of STEPS) {
    test(`${mode}: ${a} differs from ${b} by ΔL ≥ ${floor}`, () => {
      const x = map.get(a);
      const y = map.get(b);
      assert.ok(x && y && x.startsWith('#') && y.startsWith('#'), `${a}=${x} ${b}=${y} must be literal hex`);
      const d = Math.abs(oklabL(x) - oklabL(y));
      assert.ok(d >= floor, `${a} ${x} vs ${b} ${y}: ΔL ${d.toFixed(3)} < ${floor}`);
    });
  }
}

for (const [mode, map] of [['light', light], ['dark', new Map([...light, ...dark])]]) {
  for (const [fg, bg, floor] of PAIRS) {
    test(`${mode}: ${fg} on ${bg} ≥ ${floor}`, () => {
      const a = map.get(fg);
      const b = map.get(bg);
      assert.ok(a && b && a.startsWith('#') && b.startsWith('#'), `${fg}=${a} ${bg}=${b} must be literal hex`);
      const c = contrast(a, b);
      assert.ok(c >= floor, `${fg} ${a} on ${bg} ${b} = ${c.toFixed(2)} < ${floor}`);
    });
  }
}
