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

/** Step 2 — the components, the table, the app shell, and the house theme. */
export const INSTALL = `npm install @iyulab/components @iyulab/data-components @iyulab/modern-app @iyulab/house-style`;

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

/** Step 3b — `src/main.ts`: load the house theme, start the shell, route to the list screen. */
export const BOOT = `import { html } from 'lit';
import { app } from '@iyulab/modern-app';
import '@iyulab/house-style';                     // the house theme: tokens, type, density, patterns
import './ListScreenDemo.ts';                    // the recipe below — rename its tag when it is yours

await app.load({
  root: document.body,
  layout: { type: 'sidebar', title: 'Orders', main: [{ type: 'link', label: 'Orders', href: '/' }] },
  routes: [{ path: '/', render: () => html\`<house-data-patterns-list-screen></house-data-patterns-list-screen>\` }],
});`;

/** The finished result of the steps, checked in as `examples/list-app` (kept equal by the check). */
export const STARTER = `npx degit iyulab/house-style/examples/list-app my-app
cd my-app
npm install
npm run dev`;

/**
 * Step 4 — the list-screen recipe: these files, copied whole into `src/`. Paths are relative to
 * this module; the landing page imports the same files with `?raw` to show them.
 */
export const RECIPE_FILES = [
  'sections/data-patterns/ListScreenDemo.ts',
  'sections/data-patterns/constants.ts',
] as const;
