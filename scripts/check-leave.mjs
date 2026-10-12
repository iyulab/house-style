// Leaving check — every way out of the reference app's two editing surfaces asks before unsaved input is dropped.
//
// Why: an edit that vanishes on Escape, Back or a sidebar click is lost work, and nothing else here would notice —
// component tests measure the guard and the dialog one at a time, while the defects are in how a screen wires them
// (a draft kept on `change` reads as clean when Escape comes before the field is left). Run after `npm run build`.
//
// What fails: a way out that does not ask, «Keep editing» that does not keep the screen, the address and the input,
// «Discard» that does not leave, or a clean screen that asks. Leaving the document (reload, closing the tab) is
// measured as «is the browser confirmation armed» — Playwright's reload does not raise the `beforeunload` dialog.
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = join(here, '..');
if (!existsSync(join(pkg, 'publish', 'app', 'index.html')) && !existsSync(join(pkg, 'publish', 'index.html'))) {
  console.error('✗ Leaving check: no publish/ — run `npm run build` first');
  process.exit(1);
}

const { preview } = await import('vite');
const { chromium } = await import('playwright');
const server = await preview({ root: pkg, logLevel: 'silent', preview: { port: 0, strictPort: false } });
const base = server.resolvedUrls.local[0].replace(/\/?$/, '/');
const APP = base + 'app/';
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();

// Setup navigations (leaving a screen a previous case left unsaved) accept the browser confirmation; inside a case
// nothing reaches it.
let acceptNative = false;
page.on('dialog', async (d) => { await (acceptNative ? d.accept() : d.dismiss()); });
const path = () => new URL(page.url()).pathname.replace(/^.*\/app/, '') || '/';
const ask = () => page.getByRole('alertdialog', { name: 'Discard unsaved changes?' });

async function goApp() {
  acceptNative = true;
  await page.goto(APP);
  acceptNative = false;
}

await goApp();
await page.getByRole('textbox', { name: 'Username' }).fill('demo');
await page.getByRole('textbox', { name: 'Password' }).fill('demo');
await page.getByRole('button', { name: 'Sign in' }).click();
await page.getByRole('heading', { name: 'Dashboard' }).waitFor();

async function openDetail() {
  // From the app root each time — the preview server has no SPA fallback for a reload on a deep address.
  await goApp();
  await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
  await page.getByRole('navigation').getByRole('link', { name: 'Orders' }).click();
  await page.getByRole('gridcell', { name: 'Cedar & Finch' }).first().click();
  await page.getByRole('button', { name: 'Edit order' }).waitFor();
}

const armed = () => page.evaluate(() => {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
});

const failures = [];
let passed = 0;
async function check(name, body) {
  try {
    const problem = await body();
    if (problem) failures.push(`${name}: ${problem}`);
    else passed++;
  } catch (e) {
    failures.push(`${name}: ${e.message.split('\n')[0]}`);
  }
}

// The edit drawer (modal) — the customer changed.
const editDirty = async () => {
  await page.getByRole('button', { name: 'Edit order' }).click();
  await page.getByRole('textbox', { name: 'Customer' }).fill('ZZ-unsaved');
};
const drawerKeeps = async () => (await page.getByRole('textbox', { name: 'Customer' }).inputValue()) === 'ZZ-unsaved';
// The line form in the detail (non-modal) — the quantity changed.
const lineDirty = async () => { await page.getByRole('textbox', { name: 'Quantity' }).fill('7'); };
const lineKeeps = async () => (await page.getByRole('textbox', { name: 'Quantity' }).inputValue()) === '7';

/** A way out inside the app: it asks, and «Keep editing» keeps the screen, the address and the input. */
async function asksAndKeeps(name, dirty, leave, kept) {
  await check(name, async () => {
    await openDetail();
    const from = path();
    await dirty();
    await leave();
    await ask().waitFor({ timeout: 3000 }).catch(() => {});
    if ((await ask().count()) === 0) return 'did not ask';
    await ask().getByRole('button', { name: 'Keep editing' }).click();
    await page.waitForTimeout(400);
    if (path() !== from) return `left for ${path()}`;
    if (!(await kept())) return 'the input was dropped';
    return '';
  });
}

await asksAndKeeps('drawer: Escape', editDirty, () => page.keyboard.press('Escape'), drawerKeeps);
await asksAndKeeps('drawer: Cancel', editDirty, () => page.getByRole('button', { name: 'Cancel', exact: true }).click(), drawerKeeps);
await asksAndKeeps('drawer: Back', editDirty, () => page.goBack(), drawerKeeps);
await asksAndKeeps('line form: sidebar link', lineDirty, () => page.getByRole('navigation').getByRole('link', { name: 'Dashboard' }).click(), lineKeeps);
await asksAndKeeps('line form: master list link', lineDirty, () => page.getByRole('link', { name: /G-2026-0512/ }).click(), lineKeeps);
await asksAndKeeps('line form: Back', lineDirty, () => page.goBack(), lineKeeps);

for (const [name, dirty] of [['drawer: leaving the document', editDirty], ['line form: leaving the document', lineDirty]]) {
  await check(name, async () => {
    await openDetail();
    await dirty();
    return (await armed()) ? '' : 'the browser confirmation is not armed';
  });
}

await check('drawer: Escape → Discard closes and drops the edit', async () => {
  await openDetail();
  await editDirty();
  await page.keyboard.press('Escape');
  await ask().getByRole('button', { name: 'Discard' }).click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Edit order' }).click();
  const value = await page.getByRole('textbox', { name: 'Customer' }).inputValue();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  return value === 'Cedar & Finch' ? '' : `reopened with «${value}»`;
});
await check('line form: sidebar → Discard leaves', async () => {
  await openDetail();
  await lineDirty();
  await page.getByRole('navigation').getByRole('link', { name: 'Dashboard' }).click();
  await ask().getByRole('button', { name: 'Discard' }).click();
  await page.waitForTimeout(600);
  return path() === '/' ? '' : `still at ${path()}`;
});
await check('clean screen: nothing asks', async () => {
  await openDetail();
  await page.getByRole('navigation').getByRole('link', { name: 'Dashboard' }).click();
  await page.waitForTimeout(600);
  if ((await ask().count()) > 0) return 'asked on a clean screen';
  if (await armed()) return 'the browser confirmation is armed on a clean screen';
  return path() === '/' ? '' : `did not leave (${path()})`;
});

await browser.close();
await server.close();

if (failures.length) {
  console.error(`✗ Leaving check: ${failures.length} failed, ${passed} passed`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`✓ Leaving check: ${passed} ways out — each asks, keeps or leaves as chosen; a clean screen asks nothing.`);
