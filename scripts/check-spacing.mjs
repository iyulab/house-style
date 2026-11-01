// Text spacing check — every page of the built guide (`publish/`) and the reference app, with the WCAG 1.4.12 text
// spacing overrides applied to the document and to every shadow root, at a desktop and a phone width.
//
// Why: a label cut with an ellipsis or by `overflow: hidden` loses its tail for a sighted reader, and the loss grows
// when people widen letter and word spacing (WCAG 1.4.12), enlarge text (1.4.4) or read a longer translation. A
// published guide page cut the sidebar name «Voice, tone & accessibility» to «Voice, tone & accessibil…» under the
// spacing overrides, with no way to read the rest; component tests render one component at its natural width and
// never see it. The libraries' sweep asks every kept ellipsis for a reason in the source; this check looks at the
// rendered pages, where a container the library did not plan for does the cutting.
//
// What fails: an element that draws text, clips it horizontally (`overflow-x` hidden or clip) and is wider inside
// than its box, unless it or an ancestor (across shadow boundaries) carries a `title`, or it is judged in `JUDGED`
// with the reason it stands. Visually hidden text (a box of 1px or less) is not a reader's text and is skipped.
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = join(here, '..');
if (!existsSync(join(pkg, 'publish', 'index.html'))) {
  console.error('✗ Text spacing check: no publish/index.html — run `npm run build` first');
  process.exit(1);
}

const categories = readFileSync(join(pkg, 'src', 'categories.ts'), 'utf8');
const paths = ['', ...[...categories.matchAll(/\bpath:\s*'([^']+)'/g)].map((m) => m[1]), 'app/'];
if (paths.length < 3) {
  console.error('✗ Text spacing check: found no category paths in src/categories.ts — the derivation broke');
  process.exit(1);
}

const WIDTHS = [1280, 390];

/** Clipped text judged and kept — a pattern over the element path → why the full text is reachable. */
const JUDGED = [];

const SPACING = `*, *::before, *::after { line-height: 1.5 !important; letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }`;

const { preview } = await import('vite');
const { chromium } = await import('playwright');
const server = await preview({ root: pkg, logLevel: 'silent', preview: { port: 0, strictPort: false } });
const origin = server.resolvedUrls.local[0].replace(/\/house-style\/?$/, '').replace(/\/$/, '');
const browser = await chromium.launch();
const failures = [];
let judged = 0;
let measured = 0;

try {
  for (const width of WIDTHS) {
    for (const path of paths) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(`${origin}/house-style/${path}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => !!document.querySelector('u-sidebar-layout'), null, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(500);
      const found = await page.evaluate(async (spacing) => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(spacing);
        const roots = [document];
        const collect = (root) => {
          for (const el of root.querySelectorAll('*')) {
            if (el.shadowRoot) {
              roots.push(el.shadowRoot);
              collect(el.shadowRoot);
            }
          }
        };
        collect(document);
        for (const root of roots) root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        await new Promise((r) => setTimeout(r, 200));

        const label = (el) => {
          const parts = [];
          for (let n = el; n; ) {
            parts.unshift(n.localName + (n.classList?.length ? '.' + [...n.classList].join('.') : ''));
            if (n.parentElement) n = n.parentElement;
            else n = n.getRootNode()?.host ?? null;
          }
          return parts.slice(-4).join(' > ');
        };
        const titled = (el) => {
          for (let n = el; n; ) {
            if (n.hasAttribute?.('title') && n.getAttribute('title')) return true;
            if (n.parentElement) n = n.parentElement;
            else n = n.getRootNode()?.host ?? null;
          }
          return false;
        };
        const ownText = (el) => [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())
          || [...(el.shadowRoot ? [] : el.querySelectorAll('slot'))].some((s) => s.assignedNodes({ flatten: true }).some((c) => c.textContent.trim()));
        const out = [];
        let count = 0;
        for (const root of roots) {
          for (const el of root.querySelectorAll('*')) {
            if (el.clientWidth <= 1 || el.clientHeight <= 1) continue;
            const cs = getComputedStyle(el);
            if (cs.overflowX !== 'hidden' && cs.overflowX !== 'clip') continue;
            if (!ownText(el)) continue;
            count++;
            if (el.scrollWidth <= el.clientWidth + 1) continue;
            if (titled(el)) continue;
            out.push({ where: label(el), text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 60), ellipsis: cs.textOverflow === 'ellipsis' });
          }
        }
        return { out, count };
      }, SPACING);
      measured += found.count;
      let pageFailures = 0;
      for (const f of found.out) {
        if (JUDGED.some((j) => j.where.test(f.where))) {
          judged++;
          continue;
        }
        pageFailures++;
        failures.push(`/${path} @${width}: ${f.where}${f.ellipsis ? ' (ellipsis)' : ''} — «${f.text}»`);
      }
      if (!pageFailures) console.log(`  ✓ /${path} @${width}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}

if (failures.length) {
  console.error(`✗ Text spacing check: ${failures.length} clipped text element(s) with no way to read the rest\n${failures.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`✓ Text spacing check: ${paths.length} pages × ${WIDTHS.length} widths, ${measured} clipping text boxes measured, none cut (${judged} judged).`);
