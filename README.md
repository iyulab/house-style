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

**Charts and widgets from `@iyulab/u-widgets`** keep their own palette until you also load its bridge — the
charts draw in the widgets' default indigo and nothing warns:

```ts
import '@iyulab/u-widgets/themes/components.css';   // series colours, surfaces, text, status, radius, type sizes
```

It ties the widgets to the `--u-*` tokens this theme sets (`--u-chart-color-1`…`8`, `--u-bg-color`, `--u-txt-color`,
`--u-text-*-size` …), so a palette preset or seed change reaches the charts too.

| File | What it holds |
|---|---|
| `styles/index.css` (package root) | everything below plus Pretendard — for apps without Tailwind |
| `styles/theme.css` | the theme without fonts (bring your own face) |
| `styles/tokens.css` | the presets (`cool` · `warm` · `contrast`, light and dark) for the `--u-*` token axes, the seeds `--hs-accent` · `--hs-secondary` and their derived steps, the house scale, and the board scale (`hs-scale="board"` — about twice the ladder, for a screen read from across a room) |
| `styles/components.css` | the document flow (body text, `h1`–`h6`, block gaps, code spans, native control and scrollbar colours) and sizes and finish for `u-button`, `u-card`, `u-drawer`, `flex-table`, the app shell |
| `styles/patterns.css` | `hs-*` layout patterns — page head, saved views, filter bar, stat strip, table card, callout, form sections, side-sheet footer |
| `styles/marks.css` | the cell marks (`.hs-id` · `.hs-num` · `.hs-empty` · `.hs-due`) on their own — `patterns.css` imports them; a table that renders cells in a shadow root takes this file as a constructable stylesheet (`table.stylesheets = [sheet]`, the sheet built from `marks.css?inline`) |
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

### Palette — seeds from the app, balance from a preset

The application decides its colours; the house decides how the screen is balanced around them.

**Seeds.** Two colours on `:root`. Every step the components need is derived from them — a fill that white text
can sit on, a soft tint (the current navigation item, a selected row), a readable ink (links, the current tab),
and the dark-mode steps:

```css
:root {
  --hs-accent: #c8161d;      /* identity: the main action, the current item, links, focus */
  --hs-secondary: #0f766e;   /* a second emphasis: color="secondary", the second chart series */
}
```

A derivation cannot promise contrast for every seed (a pale yellow cannot carry white text). Each derived step is
its own token — `--hs-accent-fill` · `--hs-accent-contrast` · `--hs-accent-soft` · `--hs-accent-ink` (and the same
for `--hs-secondary`) — so an application overrides only the step its seed defeats. Set seeds on `:root`: a step
derived there does not follow a seed set further down the tree. Status colours (info · success · warning · danger)
never follow the seeds, so a red brand and «danger» stay two colours.

**Presets.** The balance of the whole screen — the temperature of the neutrals, the distance between canvas,
surface, lines and text, whether the main action is the accent or ink, and how dark the shell is. Each has a light
and a dark side (`theme="dark"`):

| `<html hs-palette="…">` | Neutrals | Main action | Sidebar | Current tab |
|---|---|---|---|---|
| *(none)* `cool` | cool grey | accent fill | light | accent |
| `warm` | warm grey | ink | light, neutral current item | ink |
| `contrast` | cool grey | accent fill | dark | accent |

One filled button per view under every preset — the rest are outlined, plain or in a menu.

**Fixed by the house** (token by token overridable): the 24/18/15/14/13/12/11 type ladder in Pretendard,
32/36/40 controls, 8px controls and menu items, 10px cards, pill status tags, 44px table rows (36px compact),
a 240px sidebar of 38px rows.

The type ladder is the `--u-text-*-size` steps plus two house steps derived from them —
`--hs-text-dense-size` (between body and label: table cells, definition lists, callouts) and
`--hs-text-hero-size` (display + 4px: a headline figure). Every pattern reads a step, so rescaling the
ladder (a larger mode, a product system) carries the patterns along.

### Text outside components

The theme also sets the text an application writes between components, so a screen's own words match
the components around them: the body draws at the body step (14px · 1.571), `h1`/`h2`/`h3` at the
display/title/subtitle steps and `h4`–`h6` at the body step in semibold, and paragraphs, lists and
headings get one gap below (none above, none after the last block in a box). Code spans use the house
monospace. A checked native checkbox or radio takes the selection colour (`--u-selection-color`, the
interaction blue) and scrollbars the strong line colour. Running text that can grow wider than reads
well opts into the measure: `<div class="hs-prose">` stops its paragraphs and lists at `--hs-measure`
(70ch). All of it is zero-specificity in the house layer — any rule of yours wins.

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
these libraries, at **https://iyulab.github.io/house-style/app/** (sign in with `demo` / `demo`,
or `viewer` / `viewer` for a read-only account — the backend is mocked in the browser, there are
no real accounts). It is reachable from the guide's sidebar under "Open the reference app".

The two accounts show permissions end to end: one permission decides both whether a link or
action is shown and whether its route lets the user in. The read-only account sees no create or
cancel actions, and opening the new-order screen by its address shows the blocked state
(`<u-empty-state variant="no-access">`) inside the shell.

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

`check:start-here:local` walks the same path with this working tree's `@iyulab/house-style`
packed in place of the registry's — run it before tagging a release. The deploy workflow runs
both on every push to `main`.

The guide itself is checked too: after a build, every page (the landing page and each category)
must draw its section in a browser, with no page errors — a build can drop the section modules and
still succeed. The deploy workflow runs it before uploading the site:

```bash
npm run build -w @iyulab/house-style
npm run check:guide -w @iyulab/house-style
```

## License

MIT
