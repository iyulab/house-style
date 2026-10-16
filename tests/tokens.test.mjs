// House tokens — contract tests (node --test, no dependencies).
//
// Every check runs for each preset (`cool` · `warm` · `contrast`) in light and dark, with the colour expressions
// resolved the way a browser does (tests/lib/css-color.mjs) — derived steps are measured, not assumed.
//
// ⑴ Every colour a preset's light block sets is also set by its dark block. The house layer sits above the built-in
//   defaults, so a light value the dark block forgets beats the built-in dark value — it leaks into dark mode silently.
// ⑵ Contrast floors for the pairs the theme promises (WCAG 2.x relative luminance).
// ⑵′ Perception floors for state and depth steps (OKLab lightness difference) — a quiet theme must still let a hover,
//    a press, a selection and a surface step be seen.
// ⑶ The sheet declares the shared layer order and keeps everything inside `iyu.house`.
// ⑷ The seed derivations hold for a range of brand seeds, not only the default.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { blocks, cascade, color, contrast, oklabL, deltaE, rgbToHex } from './lib/css-color.mjs';

const source = readFileSync(fileURLToPath(new URL('../styles/tokens.css', import.meta.url)), 'utf8');
const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
const all = blocks(source);

const ROOT = ':root';
const DARK = ':root[theme="dark"]';
const pal = (p) => `:root[hs-palette="${p}"]`;
const palDark = (p) => `:root[hs-palette="${p}"][theme="dark"]`;

/** Selector sets per preset × mode, in cascade order. */
const MODES = {
  'cool light': [ROOT],
  'cool dark': [ROOT, DARK],
  'warm light': [ROOT, pal('warm')],
  'warm dark': [ROOT, DARK, pal('warm'), palDark('warm')],
  'contrast light': [ROOT, pal('contrast')],
  'contrast dark': [ROOT, DARK, pal('contrast'), palDark('contrast')],
};
const maps = Object.fromEntries(Object.entries(MODES).map(([k, sel]) => [k, cascade(all, sel)]));

const block = (selector) => all.find(b => b.selector === selector)?.decls ?? new Map();
const isLiteralColour = v => /^#|^rgba?\(/.test(v);
/** The seeds are the application's choice and the same in both modes — the dark side derives from them. */
const SEED = /^--hs-(accent|secondary)$/;

test('the sheet declares the shared layer order and wraps everything in iyu.house', () => {
  assert.match(css, /^\s*@layer iyu\.base, iyu\.house;/m);
  assert.equal(css.match(/@layer iyu\.house \{/g)?.length, 1);
});

for (const [name, light, dark] of [['cool', ROOT, DARK], ['warm', pal('warm'), palDark('warm')], ['contrast', pal('contrast'), palDark('contrast')]]) {
  test(`🔴${name}: every literal colour set in light is also set in dark (no light value leaks into dark)`, () => {
    const d = block(dark);
    const missing = [...block(light)].filter(([k, v]) => isLiteralColour(v) && !SEED.test(k) && !d.has(k)).map(([k]) => k);
    assert.deepEqual(missing, []);
  });
}

test('🔴the light seed derivations all have a dark form', () => {
  const derived = [...block(ROOT).keys()].filter(k => /^--hs-(accent|secondary)-/.test(k));
  assert.ok(derived.length >= 8, derived.join(' '));
  const d = block(DARK);
  assert.deepEqual(derived.filter(k => !d.has(k)), []);
});

test('the scale block holds no colours (shape and type are mode-independent)', () => {
  const scale = all.filter(b => b.selector === ROOT)[1]?.decls;
  assert.ok(scale, 'a second :root block holds the scale');
  assert.deepEqual([...scale].filter(([, v]) => isLiteralColour(v)).map(([k]) => k), []);
});

// ── contrast ──────────────────────────────────────────────────────────────
const TEXT = 4.5;
const GRAPHIC = 3;
/** [foreground token, background token, floor] — what the theme promises in every preset and mode. */
const PAIRS = [
  ['--u-txt-color', '--u-bg-color', TEXT],
  ['--u-txt-color', '--u-canvas-bg-color', TEXT],
  ['--u-txt-color-weak', '--u-bg-color', TEXT],
  ['--u-txt-color-weak', '--u-canvas-bg-color', TEXT],
  ['--u-txt-color-weak', '--u-bg-color-raised', TEXT],
  ['--u-txt-color-weaker', '--u-bg-color', TEXT],
  ['--u-txt-color-weaker', '--u-canvas-bg-color', TEXT],
  ['--u-link-txt-color', '--u-bg-color', TEXT],
  ['--u-link-txt-color', '--u-canvas-bg-color', TEXT],
  ['--u-primary-txt-color', '--u-primary-color', TEXT],
  ['--u-primary-color-strong', '--u-bg-color', TEXT],
  ['--u-primary-color-strong', '--u-primary-bg-color', TEXT],
  ['--u-txt-color', '--u-primary-bg-color', TEXT],
  ['--u-secondary-txt-color', '--u-secondary-color', TEXT],
  ['--u-secondary-color-strong', '--u-bg-color', TEXT],
  ['--u-secondary-color-strong', '--u-secondary-bg-color', TEXT],
  ['--hs-accent-ink', '--hs-accent-soft', TEXT],
  ['--hs-tab-current-color', '--u-bg-color', TEXT],
  ['--app-sidebar-fg', '--app-sidebar-bg', TEXT],
  ['--app-sidebar-active-fg', '--app-sidebar-active-bg', TEXT],
  ['--u-input-border-color', '--u-bg-color', GRAPHIC],
  ['--u-focus-ring-color', '--u-bg-color', GRAPHIC],
  ['--u-focus-ring-color', '--u-canvas-bg-color', GRAPHIC],
  ['--u-selection-color', '--u-bg-color', GRAPHIC],
  ['--u-selection-txt-color', '--u-selection-color', GRAPHIC],
  ...['info', 'success', 'warning', 'danger'].flatMap(r => [
    [`--u-${r}-color-strong`, `--u-${r}-bg-color`, TEXT],
    [`--u-${r}-color-strong`, '--u-bg-color', TEXT],
    [`--u-${r}-txt-color`, `--u-${r}-color`, TEXT],
  ]),
];
/** The dark shell of the `contrast` preset — its own surface. */
const SHELL_PAIRS = [
  ['--hs-shell-ink', '--hs-shell-bg', TEXT],
  ['--hs-shell-ink-weak', '--hs-shell-bg', TEXT],
  ['--hs-shell-ink-weaker', '--hs-shell-bg', TEXT],
  ['--hs-shell-ink', '--hs-shell-hover', TEXT],
  ['--hs-shell-current-ink', '--hs-shell-current-bg', TEXT],
];

const rgbOf = (map, token) => {
  const v = map.get(token);
  assert.ok(v, `${token} is set`);
  return color(v, map);
};

for (const [mode, map] of Object.entries(maps)) {
  for (const [fg, bg, floor] of [...PAIRS, ...(mode.startsWith('contrast') ? SHELL_PAIRS : [])]) {
    test(`${mode}: ${fg} on ${bg} ≥ ${floor}`, () => {
      const [a, b] = [rgbOf(map, fg), rgbOf(map, bg)];
      const c = contrast(a, b);
      assert.ok(c >= floor, `${fg} ${rgbToHex(a)} on ${bg} ${rgbToHex(b)} = ${c.toFixed(2)} < ${floor}`);
    });
  }
}

// ── perception of state and depth (OKLab L) ─────────────────────────────
// WCAG ratios are for text and graphics; neighbouring surfaces differ by far less, and the ratio's
// flare term flattens dark ones. OKLab lightness is perceptually even across light and dark.
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
  ['--app-sidebar-active-bg', '--app-sidebar-bg', SELECTED],
];
for (const [mode, map] of Object.entries(maps)) {
  for (const [a, b, floor] of STEPS) {
    test(`${mode}: ${a} differs from ${b} by ΔL ≥ ${floor}`, () => {
      const [x, y] = [rgbOf(map, a), rgbOf(map, b)];
      const d = Math.abs(oklabL(x) - oklabL(y));
      assert.ok(d >= floor, `${a} ${rgbToHex(x)} vs ${b} ${rgbToHex(y)}: ΔL ${d.toFixed(3)} < ${floor}`);
    });
  }
}

// ── chart series ─────────────────────────────────────────────────────────
// The eight were validated as a set (lightness band, chroma, colour-vision simulation — an external
// validator's job). These checks keep an edit from quietly breaking what can be computed from the values, with the
// default seeds: eight distinct colours; neighbours ΔE ≥ 15 (full colour vision); no slot within ΔE 10 of a status
// colour; marks ≥ 3:1 on the surface and the raised surface — in light, slot six alone may fall short (it is
// documented to need a legend or labels).
for (const [mode, map] of Object.entries(maps)) {
  const series = [1, 2, 3, 4, 5, 6, 7, 8].map(n => rgbOf(map, `--u-chart-color-${n}`));
  const light = mode.endsWith('light');
  test(`${mode}: eight distinct chart colours`, () => {
    assert.equal(new Set(series.map(rgbToHex)).size, 8, series.map(rgbToHex).join(' '));
  });
  test(`${mode}: chart neighbours ΔE ≥ 15`, () => {
    const weak = series.slice(1).map((c, i) => [i + 1, deltaE(series[i], c)]).filter(([, d]) => d < 15);
    assert.deepEqual(weak.map(([i, d]) => `${i}↔${i + 1} ${d.toFixed(1)}`), []);
  });
  test(`${mode}: no chart colour reads as a status colour (ΔE ≥ 10)`, () => {
    const status = ['success', 'warning', 'danger'].map(r => rgbOf(map, `--u-${r}-color`));
    const near = series.flatMap((c, i) => status.filter(s => deltaE(c, s) < 10).map(s => `${i + 1} ${rgbToHex(c)}~${rgbToHex(s)}`));
    assert.deepEqual(near, []);
  });
  test(`${mode}: chart marks ≥ 3:1 on the surfaces${light ? ' (slot six excepted)' : ''}`, () => {
    const surfaces = [rgbOf(map, '--u-bg-color'), rgbOf(map, '--u-bg-color-raised')];
    const low = series.flatMap((c, i) => surfaces.filter(s => contrast(c, s) < 3).map(s => `${i + 1}@${rgbToHex(s)} ${contrast(c, s).toFixed(2)}`));
    assert.deepEqual(light ? low.filter(x => !x.startsWith('6@')) : low, []);
  });
}

// ── seeds ────────────────────────────────────────────────────────────────
// A brand seed is the application's choice. Mid-tone seeds (the colours a brand is usually given) must come out
// readable without any manual step: ink on its own soft tint, the contrast colour on the fill, links on the
// surfaces — in the cool and warm presets, light and dark.
const SEEDS = ['#1F5FBF', '#0F766E', '#6D28D9', '#C2410C', '#B42318', '#3F6212', '#2F6FEB', '#475569'];
for (const mode of ['cool light', 'cool dark', 'warm light', 'warm dark']) {
  test(`${mode}: mid-tone seeds stay readable — ink on soft, contrast on fill, links on the surfaces`, () => {
    const bad = [];
    for (const seed of SEEDS) {
      const map = new Map([...maps[mode], ['--hs-accent', seed], ['--hs-secondary', seed]]);
      for (const [fg, bg] of [
        ['--hs-accent-ink', '--hs-accent-soft'], ['--hs-accent-contrast', '--hs-accent-fill'],
        ['--u-link-txt-color', '--u-bg-color'], ['--u-link-txt-color', '--u-canvas-bg-color'],
        ['--hs-secondary-ink', '--hs-secondary-soft'], ['--hs-secondary-contrast', '--hs-secondary-fill'],
      ]) {
        const c = contrast(color(map.get(fg), map), color(map.get(bg), map));
        if (c < TEXT) bad.push(`${seed} ${fg}/${bg} ${c.toFixed(2)}`);
      }
    }
    assert.deepEqual(bad, []);
  });
}
