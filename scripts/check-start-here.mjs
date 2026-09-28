#!/usr/bin/env node
/**
 * Runs the landing page's "Start here" path in a fresh project, the way a reader would, and
 * fails unless the result is a screen with a table on it.
 *
 * Every step comes from `src/start-here.ts` — the same strings the page shows — so the guide
 * cannot promise a path this script has not walked. The packages are installed from the npm
 * registry: what a reader gets is the published build, not this workspace.
 *
 * The verdict is the rendered page, not the build. A missing decorator setting once produced a
 * green `vite build` whose bundle kept raw `@customElement(...)` syntax and rendered nothing,
 * so "it built" is exactly the claim this check refuses to accept on its own.
 *
 *   node scripts/check-start-here.mjs [--keep]
 *
 * `--keep` leaves the generated project in place (it is always kept on failure).
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { BOOT, CREATE, INDEX_HTML, INSTALL, RECIPE_FILES } from '../src/start-here.ts';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, '../src');
const keep = process.argv.includes('--keep');
const isWin = process.platform === 'win32';

// npm 10's arborist crashes on some lock-less installs (`edgesOut` of null); CI runs npm 11.
// Run the reader's `npm …` lines through npm 11 when the local npm is older.
const npmMajor = Number(run('npm', ['-v']).stdout.trim().split('.')[0]);
const npm = npmMajor >= 11 ? ['npm'] : ['npx', '-y', 'npm@11'];

const work = mkdtempSync(join(tmpdir(), 'start-here-'));
let project = work;
const steps = [];

try {
  // Step 1 — create. The only thing added to the reader's command is `--no-interactive`:
  // a script has no terminal to answer create-vite's prompts with.
  for (const line of CREATE.split('\n').map(l => l.trim()).filter(Boolean)) {
    const cd = /^cd\s+(\S+)$/.exec(line);
    if (cd) { project = join(project, cd[1]); continue; }
    step(`create: ${line}`, () => npmLine(line + ' --no-interactive', project));
  }

  // Step 2 — install, verbatim.
  step(`install: ${INSTALL}`, () => npmLine(INSTALL, project));

  // Step 3 — index.html and src/main.ts, verbatim.
  writeFileSync(join(project, 'index.html'), INDEX_HTML + '\n');
  writeFileSync(join(project, 'src', 'main.ts'), BOOT + '\n');

  // Step 4 — the recipe's files, copied whole into src/.
  for (const file of RECIPE_FILES) copyFileSync(join(srcDir, file), join(project, 'src', basename(file)));

  // The template's own build: `tsc && vite build`.
  step('build: npm run build', () => npmLine('npm run build', project));

  // A bundle the browser cannot parse renders nothing — check every chunk before opening a page.
  const assets = join(project, 'dist', 'assets');
  for (const f of readdirSync(assets).filter(f => f.endsWith('.js'))) {
    step(`parse: ${f}`, () => run(process.execPath, ['--check', join(assets, f)]));
  }

  await renderCheck(project);
  console.log(`\n✓ Start here: ${steps.length} steps passed — the path renders a table.`);
  if (keep) console.log(`  project kept: ${project}`);
  else cleanup();
} catch (err) {
  console.error(`\n✗ Start here failed at: ${err.step ?? 'setup'}\n${err.message}`);
  console.error(`  project kept for inspection: ${project}`);
  process.exit(1);
}

/** Opens `/` from a production preview and waits for table rows; any page error fails it. */
async function renderCheck(dir) {
  const { preview } = await import(pathToFileURL(join(dir, 'node_modules/vite/dist/node/index.js')).href);
  const { chromium } = await import('playwright');
  const server = await preview({ root: dir, logLevel: 'silent', preview: { port: 0, strictPort: false } });
  const url = server.resolvedUrls.local[0];
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    await page.goto(url);
    const rows = await page.waitForFunction(() => {
      const find = (root, sel) => {
        const hit = root.querySelector(sel);
        if (hit) return hit;
        for (const el of root.querySelectorAll('*')) {
          if (el.shadowRoot) { const inner = find(el.shadowRoot, sel); if (inner) return inner; }
        }
        return null;
      };
      const table = find(document, 'u-rich-table');
      const n = table?.shadowRoot?.querySelectorAll('tbody tr').length ?? 0;
      return n > 0 ? n : false;
    }, null, { timeout: 15000 }).then(h => h.jsonValue()).catch(() => 0);
    steps.push('render');
    if (!rows || errors.length) {
      const e = new Error([rows ? '' : `no table rows at ${url}`, ...errors].filter(Boolean).join('\n'));
      e.step = 'render: /';
      throw e;
    }
    console.log(`  ✓ render: / — ${rows} table rows, no page errors`);
  } finally {
    await browser.close();
    await new Promise(r => server.httpServer.close(r));
  }
}

/** Best effort: on Windows the preview server's native bindings stay loaded until this process exits. */
function cleanup() {
  try { rmSync(work, { recursive: true, force: true }); }
  catch { console.log(`  (left ${work} — a loaded native module holds a file; the OS temp directory will clear it)`); }
}

function step(name, fn) {
  try { fn(); } catch (err) { err.step = name; throw err; }
  steps.push(name);
  console.log(`  ✓ ${name}`);
}

/** Runs one of the reader's `npm …` lines, through npm 11 if needed. */
function npmLine(line, cwd) {
  const [cmd, ...args] = line.split(/\s+/);
  if (cmd !== 'npm') throw new Error(`not an npm line: ${line}`);
  return run(npm[0], [...npm.slice(1), ...args], { cwd });
}

function run(cmd, args, { cwd } = {}) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', shell: isWin, env: { ...process.env, CI: '1' } });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} → exit ${r.status}\n${(r.stdout ?? '').slice(-2000)}${(r.stderr ?? '').slice(-2000)}`);
  }
  return r;
}
