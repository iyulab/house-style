// Accessibility check — axe-core over every page of the built guide (`publish/`) and the reference app, and every
// in-app link target found on them.
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
};

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const { preview } = await import('vite');
const { chromium } = await import('playwright');
const server = await preview({ root: pkg, logLevel: 'silent', preview: { port: 0, strictPort: false } });
const origin = server.resolvedUrls.local[0].replace(/\/house-style\/?$/, '').replace(/\/$/, '');
const browser = await chromium.launch();
const failures = [];
let judged = 0;

/** Opens a page and waits for the route content to settle — returns the HTTP status. */
async function open(page, url) {
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  // Sections and the app render after their modules load — wait for the route content, then for it to settle.
  await page.waitForFunction(() => !!document.querySelector('u-sidebar-layout'), null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);
  return response?.status() ?? 0;
}

/** Every link address (absolute) through shadow roots, and whether the router's default error screen is up. */
const inspect = (page) =>
  page.evaluate(() => {
    const hrefs = [];
    let errorPage = false;
    const walk = (root) => {
      for (const el of root.querySelectorAll('*')) {
        if (el.localName === 'u-error-page') errorPage = true;
        if ((el.localName === 'a' || el.localName === 'area') && el.hasAttribute('href')) hrefs.push(el.href);
        if (el.shadowRoot) walk(el.shadowRoot);
      }
    };
    walk(document);
    return { hrefs, errorPage };
  });

// In-app links — same-origin path → the page it was first seen on. axe does not check where a link goes: a sample
// app's two main buttons led outside its deploy base and to a route that did not exist while unit, type and axe
// checks were all green, and the shell logo rendered the base without its trailing slash (a 404 under Vite).
const links = new Map();
const rendered = new Set();
try {
  for (const path of paths) {
    const page = await browser.newPage();
    await open(page, `${origin}/house-style/${path}`);
    const { hrefs, errorPage } = await inspect(page);
    if (errorPage) failures.push(`/${path}: a listed page renders the router error screen (u-error-page)`);
    rendered.add(new URL(page.url()).pathname);
    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin === origin && !links.has(url.pathname)) links.set(url.pathname, `/${path}`);
    }
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

  // Link targets: inside the base, and — when not a page already opened — opening to something other than an error.
  for (const [target, from] of links) {
    if (!target.startsWith('/house-style/')) {
      failures.push(`link ${target} (on ${from}): leaves the deploy base /house-style/`);
      continue;
    }
    if (rendered.has(target)) continue;
    const page = await browser.newPage();
    const status = await open(page, `${origin}${target}`);
    const { errorPage } = await inspect(page);
    if (status >= 400 || errorPage) {
      failures.push(`link ${target} (on ${from}): ${status >= 400 ? `HTTP ${status}` : 'router error screen (u-error-page)'}`);
    }
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
console.log(`✓ Accessibility check: ${paths.length} pages, no violations (${judged} judged: ${Object.keys(JUDGED).join(', ')}) · ${links.size} in-app link targets checked.`);
