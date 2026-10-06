// Type ladder — contract tests (node --test, no dependencies).
//
// Pattern and component text reads the ladder (`--u-text-*-size`, plus the house steps `--hs-text-*-size`) rather than
// literal px, so a consumer who rescales the ladder (a denser or larger mode, a product system) carries every pattern
// along. Each read keeps a literal fallback equal to the house value, so a page without tokens.css looks the same.
// The one exemption is the control-height recipe (buttons and fields): there the font size is a term of the
// 28/32/40 height formula, not a text step.
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
  const decl = [...tokens.matchAll(new RegExp(`${name}\s*:\s*([^;]+);`, 'g'))].map((m) => m[1].trim());
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

test('the house steps sit on the ladder: dense 13 between body and label, hero 28', () => {
  assert.ok(lightRoot.length > 0);
  assert.equal(px('--hs-text-dense-size'), 13);
  assert.equal(px('--hs-text-hero-size'), 28);
});

for (const file of ['patterns.css', 'components.css']) {
  test(`${file}: text reads a ladder step, and its fallback equals the house value`, () => {
    const offenders = [];
    for (const { selector, prop, value } of sizes(read(file))) {
      const m = value.match(/^var\((--(?:u|hs)-text-[\w-]+-size)(?:,\s*(\d+(?:\.\d+)?)px)?\)$/);
      if (m) {
        if (m[2] !== undefined && px(m[1]) !== Number(m[2])) offenders.push(`${selector} ${prop}: fallback ${m[2]}px ≠ ${m[1]} ${px(m[1])}px`);
        continue;
      }
      if (/inherit|em$|%$/.test(value)) continue;
      // Control-height recipe — the font size is a term of the 28/32/40 formula.
      if (/^(:is\([^)]*\))?u-button|^:is\(u-input/.test(selector)) continue;
      offenders.push(`${selector} ${prop}: ${value}`);
    }
    assert.deepEqual(offenders, []);
  });
}
