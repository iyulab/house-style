/**
 * The "Start here" path, as data. The landing page shows these strings, and
 * `scripts/check-start-here.mjs` runs them verbatim in a fresh project — so what a reader copies
 * is exactly what gets exercised. Change a step here and both move together.
 *
 * Plain strings only: this module is also imported by Node (type stripping), not just by Vite.
 */

/** Step 1 — a Vite project with Lit and TypeScript, with decorators already configured. */
export const CREATE = `npm create vite@latest my-app -- --template lit-ts
cd my-app`;

/** Step 2 — the components, the table, the app shell, and the house preset. */
export const INSTALL = `npm install @iyulab/components @iyulab/data-components @iyulab/modern-app @iyulab/enterprise`;

/** Step 3a — `index.html`, replacing the template's (which loads its own demo element and CSS). */
export const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Orders</title>
    <script type="module" src="/src/main.ts"></script>
  </head>
  <body></body>
</html>`;

/** Step 3b — `src/main.ts`: load the preset, start the shell, route to the list screen. */
export const BOOT = `import { html } from 'lit';
import { app } from '@iyulab/modern-app';
import '@iyulab/enterprise/styles/preset.css';   // the house style: tokens, type, density
import './ListScreenDemo.ts';                    // the recipe below — rename its tag when it is yours

await app.load({
  root: document.body,
  layout: { type: 'sidebar', title: 'Orders', main: [{ type: 'link', label: 'Orders', href: '/' }] },
  routes: [{ path: '/', render: () => html\`<house-data-patterns-list-screen></house-data-patterns-list-screen>\` }],
});`;

/**
 * Step 4 — the list-screen recipe: these files, copied whole into `src/`. Paths are relative to
 * this module; the landing page imports the same files with `?raw` to show them.
 */
export const RECIPE_FILES = [
  'sections/data-patterns/ListScreenDemo.ts',
  'sections/data-patterns/constants.ts',
] as const;
