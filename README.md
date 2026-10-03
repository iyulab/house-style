# House Style

The iyulab house theme for `@iyulab/components`, `@iyulab/modern-app` and `@iyulab/flex-table`,
and the guide that documents it.

- **The theme** (`@iyulab/house-style` on npm) is CSS only: house token values, component
  recipes, line-of-business layout patterns and a Tailwind CSS v4 preset. One import turns the
  neutral component defaults into a finished, quiet, dense business UI.
- **The guide** (the website below) shows every value read live from the theme it loads, so it
  cannot drift from the files an application imports.

## Use the theme

```bash
npm install @iyulab/house-style
```

```ts
import '@iyulab/house-style';   // fonts + tokens + component recipes + layout patterns
```

**A Tailwind CSS v4 app** imports the Tailwind entry instead, from its Tailwind stylesheet — not
`@iyulab/house-style` from JS:

```css
@import 'tailwindcss';
@import '@iyulab/house-style/styles/tailwind.css';           /* theme + role utilities */
@import '@iyulab/house-style/styles/tailwind-neutrals.css';  /* optional: gray-*/slate-* follow the theme */
```

Tailwind declares its own layers (`theme, base, components, utilities`) after the house layers,
so its preflight would beat the theme; `tailwind.css` imports the theme into Tailwind's
`components` layer — above preflight, below utilities and your own CSS.

| File | What it holds |
|---|---|
| `styles/index.css` (package root) | everything below plus Pretendard — for apps without Tailwind |
| `styles/theme.css` | the theme without fonts (bring your own face) |
| `styles/tokens.css` | house values for the `--u-*` token axes, light and dark; brand tokens `--hs-brand*` |
| `styles/components.css` | sizes and finish for `u-button`, `u-card`, `u-drawer`, `flex-table`, the app shell |
| `styles/patterns.css` | `hs-*` layout patterns — page head, saved views, filter bar, stat strip, table card, callout, form sections, side-sheet footer |
| `styles/tailwind.css` | the Tailwind v4 entry: fonts + theme (in Tailwind's `components` layer) + role utilities — `bg-canvas`, `text-ink-weak`, `border-line`, `bg-warning-soft`, `rounded-card` … |
| `styles/tailwind-neutrals.css` | optional: Tailwind's grey ramps (`gray`, `slate`, `zinc`, `neutral`, `stone`) follow the house neutrals |
| `styles/fonts.css` | Pretendard Variable (dynamic subset) |

### Cascade layers — your CSS always wins

```
@layer iyu.base, iyu.house;
  iyu.base    @iyulab/components built-in defaults
  iyu.house   this theme
  (unlayered) your application
```

Requires `@iyulab/components` 2.0 or later (the release that put its defaults in `iyu.base`).
Because the application is unlayered, a plain `:root { … }` rule overrides the theme — no
specificity tricks, no load-order rules. Scope a mode-specific value with `:root[theme="dark"]`.

### Brand it

The house is neutral on purpose. An application sets its identity colour with three tokens and
keeps it out of buttons and warnings (a red brand next to a red "danger" reads as one colour):

```css
:root {
  --hs-brand: #c8161d;        /* logo mark */
  --hs-brand-soft: #fcebec;   /* current navigation item */
  --hs-brand-ink: #a3121a;    /* its text */
}
:root[theme="dark"] {
  --hs-brand-soft: #3a1a1c;
  --hs-brand-ink: #ff9a9e;
}
```

Everything else — warm-grey neutrals, the ink primary action, blue for links and focus, status
tints, the 22/18/15/14/13/12/11 type ladder, 28/32/40 controls, 40px table rows — comes from the
theme and can be overridden token by token.

## The guide

**Live**: https://iyulab.github.io/house-style/ — this is the guide. There is no
separate docs site; the page above is the only place to read it.

The live page is organized into sections:

- **Visual identity & tokens** — type scale, colour roles, surfaces and ink, chart colours, radius, elevation
- **Layout & viewport** — the responsive sidebar shell, nav/routes, breakpoints
- **Component depth** — surfaces and controls at the standard radius and elevation
- **Data patterns** — how tabular/record data is presented
- **Feedback & motion** — alerts, progress, and waiting states
- **User flows** — CRUD, wizard, and bulk-action patterns
- **Voice, tone & accessibility** — focus visibility and keyboard interaction

## The reference app

The guide has a second half: a small but working line-of-business app, assembled only from
these libraries, at **https://iyulab.github.io/house-style/app/** (sign in with `demo` / `demo`
— the backend is mocked in the browser, there are no real accounts). It is reachable from the
guide's sidebar under "Open the reference app".

Where the guide shows each pattern on its own, the app shows them load-bearing: a sidebar shell,
a list screen with filtering, selection and bulk actions, a master-detail order screen with an
edit drawer, and a multi-step wizard. It is held to the guide rather than kept beside it — a
check in this monorepo compares the two and reports any layout primitive one half uses and the
other does not.

Sections that say "Not yet decided" mean exactly that — no design decision has
been made for that area yet, rather than the guide inventing one.

## Local development

From the `node-packages` monorepo root (never from inside this directory):

```bash
npm install
npm run start -w @iyulab/house-style
```

The landing page's "Start here" path is checked end to end: a fresh `create-vite` project, the
published packages, the page's own `index.html` / `main.ts` / recipe files, a production build,
and a browser that must find table rows on `/`. The deploy workflow runs it before publishing the
site; run it locally with (needs network and Playwright's Chromium):

```bash
npm run check:start-here -w @iyulab/house-style
```

## License

MIT
