// Accessibility check — axe-core over every page of the built guide (`publish/`) and the reference app.
//
// Why: component tests measure one component at a time; the defects axe finds on a real page are in the
// composition — a select with no visible label, a drawer labelled by an empty header, two tables whose pagination
// landmarks share one name, a progress bar a shell keeps in the tree while idle. A run over the guide found five
// such defects (two in the libraries) that every unit suite passed. Run after `npm run build`.
//
// What fails: any axe violation, except the judged ones in `JUDGED` — each names the rule, the node it is judged
// for, and why it stands. A judged rule on any other node still fails.
import { readFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = join(here, '..');
if (!existsSync(join(pkg, 'publish', 'index.html'))) {
  console.error('✗ Accessibility check: no publish/index.html — run `npm run build` first');
  process.exit(1);
}

const categories = readFileSync(join(pkg, 'src', 'categories.ts'), 'utf8');
const paths = ['', ...[...categories.matchAll(/\bpath:\s*'([^']+)'/g)].map((m) => m[1]), 'app/'];
if (paths.length < 3) {
  console.error('✗ Accessibility check: found no category paths in src/categories.ts — the derivation broke');
  process.exit(1);
}

/** Violations judged and kept — rule → { target the judgement covers, reason }. */
const JUDGED = {
  region: {
    target: /^u-sidebar-layout,\.skip-link$/,
    reason: 'the shell skip link is the first Tab stop, before every landmark; axe resolves a skip link target only with document.getElementById, which cannot reach the shell shadow root',
  },
  'scrollable-region-focusable': {
    target: /^u-sidebar-layout,main$/,
    reason: 'the shell content region takes focus from the skip link and on every route change (tabindex -1) and scrolls by keyboard from anywhere inside it',
  },
};

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const { preview } = await import('vite');
const { chromium } = await import('playwright');
const server = await preview({ root: pkg, logLevel: 'silent', preview: { port: 0, strictPort: false } });
const origin = server.resolvedUrls.local[0].replace(/\/house-style\/?$/, '').replace(/\/$/, '');
const browser = await chromium.launch();
const failures = [];
let judged = 0;
try {
  for (const path of paths) {
    const page = await browser.newPage();
    await page.goto(`${origin}/house-style/${path}`, { waitUntil: 'networkidle' });
    // Sections and the app render after their modules load — wait for the route content, then for it to settle.
    await page.waitForFunction(() => !!document.querySelector('u-sidebar-layout'), null, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () =>
      (await window.axe.run(document)).violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        targets: v.nodes.map((n) => n.target.join(' > ')),
      })),
    );
    let pageFailures = 0;
    for (const v of violations) {
      for (const target of v.targets) {
        if (JUDGED[v.id]?.target.test(target)) {
          judged++;
          continue;
        }
        pageFailures++;
        failures.push(`/${path}: ${v.id} (${v.impact}) — ${v.help}\n      ${target}`);
      }
    }
    if (!pageFailures) console.log(`  ✓ /${path}`);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}

if (failures.length) {
  console.error(`✗ Accessibility check: ${failures.length} violation(s)\n${failures.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`✓ Accessibility check: ${paths.length} pages, no violations (${judged} judged: ${Object.keys(JUDGED).join(', ')}).`);
