// Control ladder render check — the six sized controls, drawn with the house sheet over the components, keep their
// sizes in order at every control density, and buttons stay level with fields.
//
// Why: the size ladder is owned by two packages. The components define sm / md / lg as a function of the control
// density (`--u-density`); this sheet restyles the same steps. Each side's own tests measure only itself — the
// components without this sheet, `tests/control-ladder.test.mjs` this sheet's declarations against a copy of the
// components' formula. When the components made sm follow the density while this sheet still pinned md and lg in
// px, both suites stayed green and a raised density drew sm larger than md. Only the rendered composition shows it.
//
// What it measures, on the built guide (which loads the components and this sheet as a consumer does): for each
// density, each control at each size — the host height and the font size of the element that draws the text.
// Fails if a step is not taller than the one below it, if its text is smaller than the one below it (a field's lg keeps
// md's text — its step is the padding — so text may stay level, never shrink), if a field is not level with the button
// of the same step, or if the default density is not 28 / 32 / 40. Run after `npm run build`.
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = join(here, '..');
if (!existsSync(join(pkg, 'publish', 'index.html'))) {
  console.error('✗ Ladder check: no publish/index.html — run `npm run build` first');
  process.exit(1);
}

/** Tag → the shadow part that draws the text, and whether the host height is a single-line step. */
const CONTROLS = {
  'u-button': { part: 'button', line: true },
  'u-input': { part: 'input', line: true },
  'u-select': { part: 'container', line: true },
  'u-date-picker': { part: 'input', line: true },
  'u-date-range-picker': { part: 'input', line: true },
  'u-textarea': { part: 'textarea', line: false },
};
const SIZES = ['sm', 'md', 'lg'];
const DENSITIES = [12, 14, 16, 18];
const DEFAULT = { density: 14, heights: { sm: 28, md: 32, lg: 40 } };
const LEVEL = 0.5; // px — a field and a button of the same step are level within this

const { preview } = await import('vite');
const { chromium } = await import('playwright');
const server = await preview({ root: pkg, logLevel: 'silent', preview: { port: 0, strictPort: false } });
const origin = server.resolvedUrls.local[0].replace(/\/house-style\/?$/, '').replace(/\/$/, '');
const browser = await chromium.launch();
const failures = [];
let measured = 0;
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(`${origin}/house-style/`, { waitUntil: 'networkidle' });

  const result = await page.evaluate(
    async ({ controls, sizes, densities }) => {
      const missing = [];
      for (const tag of Object.keys(controls)) {
        const defined = await Promise.race([
          customElements.whenDefined(tag).then(() => true),
          new Promise((r) => setTimeout(() => r(false), 10000)),
        ]);
        if (!defined) missing.push(tag);
      }
      if (missing.length) return { missing };

      const out = {};
      for (const density of densities) {
        const host = document.createElement('div');
        host.style.cssText = `--u-density: ${density}px; position: absolute; left: 0; top: 0; display: flex; align-items: flex-start; gap: 8px;`;
        const els = [];
        for (const tag of Object.keys(controls)) {
          for (const size of sizes) {
            const el = document.createElement(tag);
            el.setAttribute('size', size);
            if (tag === 'u-button') el.textContent = 'Save';
            host.append(el);
            els.push({ tag, size, el });
          }
        }
        document.body.append(host);
        await Promise.all(els.map(({ el }) => el.updateComplete));
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        out[density] = {};
        for (const { tag, size, el } of els) {
          const text = el.shadowRoot?.querySelector(`[part~="${controls[tag].part}"]`);
          (out[density][tag] ??= {})[size] = {
            height: el.getBoundingClientRect().height,
            font: text ? parseFloat(getComputedStyle(text).fontSize) : null,
          };
        }
        host.remove();
      }
      return { out };
    },
    { controls: CONTROLS, sizes: SIZES, densities: DENSITIES },
  );

  if (result.missing) failures.push(`not defined on the guide page: ${result.missing.join(', ')}`);
  for (const [density, byTag] of Object.entries(result.out ?? {})) {
    for (const [tag, steps] of Object.entries(byTag)) {
      for (const size of SIZES) {
        measured++;
        const { height, font } = steps[size];
        if (font == null) failures.push(`${density}px ${tag}[size=${size}]: no [part~="${CONTROLS[tag].part}"] to read the font from`);
        if (!(height > 0)) failures.push(`${density}px ${tag}[size=${size}]: no height`);
      }
      for (let i = 1; i < SIZES.length; i++) {
        const lo = steps[SIZES[i - 1]];
        const hi = steps[SIZES[i]];
        const pair = `${SIZES[i - 1]} → ${SIZES[i]}`;
        if (lo.font != null && hi.font != null && hi.font < lo.font) {
          failures.push(`${density}px ${tag}: font shrinks ${pair} (${lo.font} → ${hi.font}px)`);
        }
        if (CONTROLS[tag].line && !(hi.height > lo.height)) {
          failures.push(`${density}px ${tag}: height does not grow ${pair} (${lo.height} → ${hi.height}px)`);
        }
      }
    }
    for (const size of SIZES) {
      const button = byTag['u-button'][size].height;
      for (const [tag, { line }] of Object.entries(CONTROLS)) {
        if (!line || tag === 'u-button') continue;
        const h = byTag[tag][size].height;
        if (Math.abs(h - button) > LEVEL) {
          failures.push(`${density}px ${tag}[size=${size}] is ${h}px, the button of the same step ${button}px`);
        }
      }
    }
  }
  const atDefault = result.out?.[DEFAULT.density]?.['u-button'];
  if (atDefault) {
    for (const size of SIZES) {
      const h = Math.round(atDefault[size].height * 100) / 100;
      if (h !== DEFAULT.heights[size]) {
        failures.push(`default density: u-button[size=${size}] is ${h}px, the house ladder says ${DEFAULT.heights[size]}px`);
      }
    }
  }
  failures.push(...errors);
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}

if (failures.length) {
  console.error(`✗ Ladder check: ${failures.length} problem(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ Ladder check: ${Object.keys(CONTROLS).length} controls × ${SIZES.length} sizes × ${DENSITIES.length} densities (${measured} measured) — taller each step, text never smaller, fields level with buttons`);
