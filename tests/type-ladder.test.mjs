// Type ladder — contract tests (node --test, no dependencies).
//
// Pattern and component text reads the ladder (`--u-text-*-size`, plus the house steps `--hs-text-*-size`) rather than
// literal px, so a consumer who rescales the ladder (a denser or larger mode, a product system) carries every pattern
// along. Each read keeps a literal fallback equal to the house value, so a page without tokens.css looks the same.
// The one exemption is the control-height recipe (buttons and fields): there the font size is a term of the
// 32/36/40 height formula, not a text step.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (f) => readFileSync(fileURLToPath(new URL(`../styles/${f}`, import.meta.url)), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');
const tokens = read('tokens.css');
const lightRoot = tokens.slice(tokens.indexOf(':root'), tokens.indexOf(':root[theme="dark"]'));

/** The house value of a size token, in px — literal, or a calc over other size tokens. */
function px(name, seen = new Set()) {
  assert.ok(!seen.has(name), `cycle at ${name}`);
  seen.add(name);
  const decl = [...tokens.matchAll(new RegExp(String.raw`${name}\s*:\s*([^;]+);`, 'g'))].map((m) => m[1].trim());
  assert.ok(decl.length > 0, `${name} is declared in tokens.css`);
  const expr = decl[0]
    .replace(/var\((--[\w-]+)\)/g, (_, n) => String(px(n, seen)))
    .replace(/calc\(/g, '(')
    .replace(/(\d+(?:\.\d+)?)px/g, '$1');
  assert.match(expr, /^[\d+\-*/(). ]+$/, `${name} reduces to arithmetic: ${expr}`);
  return Function(`return (${expr})`)();
}

/** `font-size` (and flex-table's `--ft-*font-size`) declarations with their selector. */
function sizes(source) {
  const out = [];
  for (const rule of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const d of rule[2].matchAll(/(font-size|--ft-[\w-]*font-size)\s*:\s*([^;]+);/g)) {
      out.push({ selector: rule[1].trim().replace(/\s+/g, ' '), prop: d[1], value: d[2].trim() });
    }
  }
  return out;
}

test('the house steps sit on the ladder: dense 13 between body and label, hero 28 (display 24 + 4)', () => {
  assert.ok(lightRoot.length > 0);
  assert.equal(px('--hs-text-dense-size'), 13);
  assert.equal(px('--hs-text-hero-size'), 28);
});

for (const file of ['patterns.css', 'marks.css', 'components.css']) {
  test(`${file}: text reads a ladder step, and its fallback equals the house value`, () => {
    const offenders = [];
    for (const { selector, prop, value } of sizes(read(file))) {
      const m = value.match(/^var\((--(?:u|hs)-text-[\w-]+-size)(?:,\s*(\d+(?:\.\d+)?)px)?\)$/);
      if (m) {
        if (m[2] !== undefined && px(m[1]) !== Number(m[2])) offenders.push(`${selector} ${prop}: fallback ${m[2]}px ≠ ${m[1]} ${px(m[1])}px`);
        continue;
      }
      if (/inherit|em$|%$/.test(value)) continue;
      // Control-height recipe — the font size is a term of the 32/36/40 formula.
      if (/^(:is\([^)]*\))?u-button|^:is\(u-input/.test(selector)) continue;
      offenders.push(`${selector} ${prop}: ${value}`);
    }
    assert.deepEqual(offenders, []);
  });
}

test('board scale: the same ladder about twice as large, its derived steps restated in scope', () => {
  const at = tokens.indexOf('[hs-scale="board"]');
  assert.ok(at > 0, 'tokens.css declares [hs-scale="board"]');
  const block = tokens.slice(at, tokens.indexOf('}', at));
  const value = (name) => Number(block.match(new RegExp(String.raw`${name}\s*:\s*(\d+)px`))?.[1]);
  const steps = ['display', 'title', 'subtitle', 'body', 'label', 'caption', 'overline'].map((s) => [s, value(`--u-text-${s}-size`)]);
  for (const [step, size] of steps) assert.ok(size >= 22, `board ${step} ${size}px is readable across a room (≥ 22px)`);
  // The ladder keeps its order: each step at least the next one down.
  for (let i = 1; i < steps.length; i++) assert.ok(steps[i - 1][1] >= steps[i][1], `${steps[i - 1][0]} ≥ ${steps[i][0]}`);
  // A derivation resolves where it is declared — the root one would keep root sizes inside the board.
  assert.match(block, /--hs-text-dense-size\s*:\s*calc\(/);
  assert.match(block, /--hs-text-hero-size\s*:\s*calc\(/);
});
