# Changelog

## [0.1.4] - 2026-10-07

### Fixed

- **The control ladder follows the control density** (`--u-density`). Button font sizes were literal (md 13px, lg
  14px) and so were the field and button paddings, so a host that raised the density grew only some steps: with
  `@iyulab/components` 2.13 (sm follows the density) a small button became larger than a default one (13.7 > 13px),
  and buttons stopped lining up with fields. Font sizes are now steps of the density and paddings are em. At the
  default 14px nothing changes — 12 / 13 / 14px and 28 / 32 / 40px; at 16px all three steps grow in order and
  buttons and fields stay level.

## [0.1.3] - 2026-10-06

### Fixed

- **A sidebar group holding the current page keeps a readable header.** `@iyulab/modern-app` derived that header's
  text from the active background, which this theme makes light (`--hs-brand-soft`), so the text sank into the
  panel (about 1.6:1 light, 1.1:1 dark). The theme now sets `--app-sidebar-group-active-fg` to `--hs-brand-ink`, the
  color it already uses for text on that background (`@iyulab/modern-app` 0.39 reads it).
- **Patterns follow the type ladder.** `patterns.css` set font sizes in px (11, 12, 13, 28 — 19 places) and flex-table
  cells and headers did too, so a consumer who rescaled `--u-text-*-size` saw components and body text change while
  tables, pagers, definition lists and stats stayed put. They now read the steps — label, caption and overline, plus
  two house steps derived from the ladder: `--hs-text-dense-size` (between body and label — the 13px of table cells,
  definition lists, callouts) and `--hs-text-hero-size` (display + 6px — the 28px headline figure). Each read keeps
  the current px as its fallback, so nothing changes at the house ladder. Button and field font sizes stay literal:
  they are terms of the 28/32/40 control-height formula.

## [0.1.2] - 2026-10-06

### Fixed

- **Plain links take the house link colour.** The theme defined `--u-link-txt-color` but only
  `hs-*` classes read it, so a link without a class kept the browser's blue (`#0000EE`, and a
  different blue again in dark mode). A zero-specificity `:where(a:any-link)` default now applies the
  token; a class on the link and any application rule still win. The underline stays.
- **A table's totals get one separating line, not one per row.** `.hs-table tfoot td` drew a top
  border on every totals row, so subtotal · tax · total read as stripes. The line is now on the first
  totals row only.
- A whole card as a link (`a.hs-card`) keeps ink text and no underline, and a `.hs-views__tab`
  rendered as a link has no underline — both used to take the browser's link styling.

## [0.1.1] - 2026-10-05

### Fixed

- **`import '@iyulab/house-style'` type-checks.** The package entry resolved straight to a `.css`
  file, which TypeScript cannot read, so a project with `noUncheckedSideEffectImports` (Vite's
  TypeScript templates turn it on) failed with TS2882. The entry now carries a `types` condition
  pointing at an empty declaration; bundlers still load `styles/index.css`.
- The `examples/list-app` starter used the removed `color="gray"` for pending tags; it now uses
  `neutral`, matching the guide.

## [0.1.0] - 2026-10-05

First release as a package. Until now `@iyulab/house-style` was only the guide site.

### Added

- **Speaks `@iyulab/components` 2.0's appearance vocabulary** — the guide, the reference app and
  the example use `appearance` (`plain` for the former `ghost`, `soft` for `filled`), status tags
  are `soft` with a `dot`, `color="neutral"` is the grey label. Text fields get the same three
  heights as buttons (28 / 32 / 40) through `size`.

- **The house theme, CSS only, in the `iyu.house` cascade layer** (requires `@iyulab/components`
  2.0, whose defaults sit in `iyu.base`; unlayered application CSS always wins):
  - `styles/tokens.css` — warm-grey neutrals, ink primary action, blue reserved for links and
    focus (`--u-focus-ring-color`), status tints with AA text, canvas vs surface
    (`--u-canvas-bg-color`), radius 4/6/10, a flat surface lift and one overlay shadow,
    Pretendard and the 22/18/15/14/13/12/11 type ladder — light and dark. Brand tokens
    `--hs-brand`, `--hs-brand-soft`, `--hs-brand-ink` (neutral by default).
  - `styles/components.css` — 28/32/40 buttons, flat cards, side-sheet header and visible body
    scrollbar, 40px `flex-table` rows with a quiet header and no zebra, page header eyebrow and
    description, the shell's canvas and page padding.
  - `styles/patterns.css` — `hs-*` patterns: page head, saved-view tabs with counts, filter bar,
    stat strip, table card with selection toolbar and pager, plain table with row actions on
    hover, card and description list, two-column detail, callout (info · success · warning ·
    danger · note), form sections and fields, side-sheet footer, attribute label, days-left mark.
  - `styles/tailwind.css` — the Tailwind CSS v4 entry: imports the theme into Tailwind's
    `components` layer (Tailwind's preflight would otherwise beat the house layer) and maps the
    roles to utilities. `styles/tailwind-neutrals.css` (opt-in) points Tailwind's grey ramps at the
    house neutrals.
  - `styles/fonts.css` — Pretendard Variable, dynamic subset.
- Absorbs `@iyulab/enterprise/styles/preset.css`: the type scale, radius and elevation values now
  live here with the rest of the house values (enterprise drops its copy in its next minor).
- `npm test` — token contract: every light colour has a dark value (the house layer would
  otherwise leak a light value into dark mode) and the promised contrast pairs hold in both modes.
