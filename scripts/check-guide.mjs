// Guide render check — every page of the built guide (`publish/`) draws its section.
//
// Why: the guide was blank for a day, live. `package.json` `sideEffects` (written for the published CSS)
// was applied by the site's own build to its section modules, so every `import './sections/X.js'` was
// dropped: the shell rendered, each route's element was never defined, and nothing failed — the build,
// the tests and the Start here check (which renders the example app, not the guide) all passed.
//
// What it measures, per route (the index plus every `CATEGORIES` path, read from `src/categories.ts`):
// the outlet's element is a defined custom element and it takes up space (sections render into light DOM
// or a shadow root — either way the box has height); and the
// page raised no error. Run after `npm run build`.
//
// And the guide is the house's first consumer of its document-flow layer: every paragraph the page writes
// itself draws at the body step (`--u-text-body-size` · `-leading`) and stops at the prose measure
// (`--hs-measure`). Before that layer, guide prose drew at the browser's 16px · `line-height: normal`
// across a whole 1100px card.
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = join(here, '..');
if (!existsSync(join(pkg, 'publish', 'index.html'))) {
  console.error('✗ Guide check: no publish/index.html — run `npm run build` first');
  process.exit(1);
}

const categories = readFileSync(join(pkg, 'src', 'categories.ts'), 'utf8');
const paths = ['', ...[...categories.matchAll(/\bpath:\s*'([^']+)'/g)].map((m) => m[1])];
if (paths.length < 2) {
  console.error('✗ Guide check: found no category paths in src/categories.ts — the derivation broke');
  process.exit(1);
}

const { preview } = await import('vite');
const { chromium } = await import('playwright');
const server = await preview({ root: pkg, logLevel: 'silent', preview: { port: 0, strictPort: false } });
const origin = server.resolvedUrls.local[0].replace(/\/house-style\/?$/, '').replace(/\/$/, '');
const browser = await chromium.launch();
const failures = [];
try {
  for (const path of paths) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      // A missing favicon is the host's, not the guide's.
      if (m.type() === 'error' && !/favicon/.test(m.location()?.url ?? '')) errors.push(`console: ${m.text()}`);
    });
    const url = `${origin}/house-style/${path}`;
    await page.goto(url);
    const result = await page
      .waitForFunction(() => {
        const outlet = document.querySelector('u-sidebar-layout')?.querySelector('u-outlet');
        const el = outlet?.firstElementChild;
        if (!el) return false;
        const tag = el.tagName.toLowerCase();
        const defined = !!customElements.get(tag);
        const height = el.getBoundingClientRect().height;
        return defined && height > 0 ? { tag, height } : false;
      }, null, { timeout: 15000 })
      .then((h) => h.jsonValue())
      .catch(async () =>
        page.evaluate(() => {
          const el = document.querySelector('u-sidebar-layout')?.querySelector('u-outlet')?.firstElementChild;
          return { failed: true, tag: el?.tagName.toLowerCase() ?? '(none)', defined: el ? !!customElements.get(el.tagName.toLowerCase()) : false };
        }),
      );
    if (result.failed) failures.push(`/${path}: <${result.tag}> ${result.defined ? 'renders nothing' : 'is not defined — its module never loaded'}`);
    else {
      const prose = await page.evaluate(() => {
        const el = document.querySelector('u-sidebar-layout')?.querySelector('u-outlet')?.firstElementChild;
        const root = getComputedStyle(document.documentElement);
        const size = parseFloat(root.getPropertyValue('--u-text-body-size'));
        const leading = parseFloat(root.getPropertyValue('--u-text-body-leading'));
        const probe = document.createElement('p');
        probe.style.cssText = 'position:absolute;visibility:hidden;inline-size:var(--hs-measure)';
        el.appendChild(probe);
        const measure = probe.getBoundingClientRect().width;
        probe.remove();
        const off = [];
        for (const p of el.querySelectorAll('p')) {
          // Demos and pattern samples (`hs-*`, a classed paragraph) set their own step — only the guide's prose is measured.
          if (p.matches('[class]') || p.closest('[class*="demo"], [class*="hs-"], pre, table, u-card')) continue;
          const cs = getComputedStyle(p);
          const lh = parseFloat(cs.lineHeight);
          if (parseFloat(cs.fontSize) !== size || Math.abs(lh - size * leading) > 0.5) off.push(`${cs.fontSize}/${cs.lineHeight}`);
          else if (p.getBoundingClientRect().width > measure + 0.5) off.push(`${Math.round(p.getBoundingClientRect().width)}px wide > measure ${Math.round(measure)}px`);
        }
        return { count: el.querySelectorAll('p').length, off: [...new Set(off)] };
      });
      if (prose.off.length) failures.push(`/${path}: prose off the body step or the measure — ${prose.off.join(', ')}`);
    }
    for (const e of errors) failures.push(`/${path}: ${e}`);
    if (!result.failed) console.log(`  ✓ /${path} — <${result.tag}> ${Math.round(result.height)}px`);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}

if (failures.length) {
  console.error(`✗ Guide check: ${failures.length} problem(s)\n${failures.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`✓ Guide check: ${paths.length} pages render their section.`);
