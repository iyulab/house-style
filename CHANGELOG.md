# Changelog

## [Unreleased]

### Added

- **`u-field` as the house form row** — 40px controls (the edit-form size, with the density), the label at the label
  step in the weak colour, the help line in the weaker colour and the error in the danger colour. Needs
  `@iyulab/components` 2.26 (the `header` · `label` · `footer` parts).

- **`u-list-page` as the house list screen** — the filters row centred with an 8px gap, a search field
  (`type="search"`) at 240–360px, and with `appearance="card"` a flat surface (10px radius) with a 48px toolbar and a
  quiet pager line (12px, weak, tabular). Needs `@iyulab/enterprise` 0.33.

- **The table toolbar as the bulk-action bar** — a 48px band above the rows; while rows are selected it takes the
  primary tint, and its title (the count, or what the list holds) sits at the dense step, semibold, in ink. On a card
  list page the toolbar row is a `u-action-bar` with the title in `slot="summary"`, and the tint follows the page's
  `:state(selected)` (`@iyulab/enterprise` 0.34.1); `u-rich-table` gets the same look on its own toolbar and selection
  bar (`@iyulab/data-components` 0.50).

### Changed

- Requires `@iyulab/components` 2.26.0 or later (peer range `^2.26.0`) — the `u-field` recipe styles its `header`,
  `label` and `footer` parts.

### Deprecated

- **`.hs-filter-bar` (and `__search` · `__end`) and `.hs-chips` — use `u-list-page`** (`@iyulab/enterprise` 0.33): the
  search and filters in `slot="filters"`, the applied chips in `slot="applied"` (it folds when empty), `__end` →
  `margin-inline-start: auto` on the last filter. Removed in 0.7.0.
- **`.hs-table-card` and `.hs-pager` — use `<u-list-page appearance="card">`** with `u-pagination` in `slot="pager"`.
  Removed in 0.7.0.
- **`.hs-table-toolbar` (`--selected` · `__title` · `__actions`) — use `<u-action-bar slot="toolbar">`** on a card list
  page, the title in `slot="summary"`; the selected tint follows the page's `:state(selected)`. `u-rich-table` styles
  its own toolbar. Removed in 0.7.0.
- **`.hs-field` and its parts — use `<u-field label>`** (`@iyulab/components` 2.26): `__label` → `label`, `__required`
  → `required`, `__help` → `description`, `__error` → `invalid` with `validation-message`. The component also names the
  control it wraps (the class pattern relied on a wrapping `<label>`). Removed in 0.7.0.
- **`.hs-card` (`__head` · `__title` · `__link`) — a titled card is `<u-group-box title>`** (`@iyulab/modern-app`) with
  the link in `slot="actions"`; an untitled surface is `<u-card>`, or `<u-group-box flush>` when the content runs to
  the edge and holds a sticky footer (`u-card` clips its overflow). Removed in 0.7.0.

### Guide

- The edit form's fields are `u-field`.
- The list screen is a `u-list-page appearance="card"` — filters, an applied chip, the toolbar, the table and a
  `u-pagination`.

## [0.5.0] - 2026-10-14

### Added

- **The inline alert as the house callout.** `u-alert[inline]` lays its footer out as a right-hand action column
  beside the title and body, at the dense text step (13px · 20px lines), with the body in the weak text colour.
- `u-tag[size='sm']` — the small step stays an 18px mark (no block padding, 5px sides) under the house tag padding.
- `u-tab-nav` — the tab strip of links draws the current view in ink (ink text, ink underline, semibold) at the dense
  text step.

### Changed

- Requires `@iyulab/components` 2.25.0 or later (peer range `^2.25.0`) — the recipes above style its `u-tab-nav`,
  `u-tag size` and `u-alert inline`.

### Deprecated

- **`.hs-callout` and its parts — use `<u-alert inline open>`** (`@iyulab/components` 2.25): `--warning` / `--info` /
  `--success` / `--danger` → `status`, `__title` → `title`, `__body` → the content, `__actions` → `slot="footer"`
  (the house puts it in the right-hand column). A note (`--note`) is `status="notice"` with `role="note"` and its
  pencil in `slot="icon"`, so it is not announced as news. Removed in 0.6.0.
- **`.hs-views` / `.hs-views__tab` and `.hs-count` — use `<u-tab-nav label>` with `<u-tab href count>`**
  (`@iyulab/components` 2.25). Saved views are URLs, so the tabs are links in a navigation landmark: the current view
  is `aria-current="page"` (set `value` on the strip), and each link is a Tab stop. Removed in 0.6.0.
- **A whole card as a link (`a.hs-card`, `.hs-card--link`) — use `<u-card href>`** (`@iyulab/components` 2.25): the
  outer box is the link, the border carries hover, the card does not lift. The titled card itself stays. Removed in
  0.6.0.
- **`.hs-attr` — use `<u-tag size="sm" appearance="outlined">`** (`@iyulab/components` 2.25). Removed in 0.6.0.

### Removed

- The 0.4.0 deprecations: `.hs-page-head` and its parts (use `u-page-header`), `.hs-kbd` (use `<kbd>`), `.hs-stats` /
  `.hs-stat` and its parts including `.hs-stat--hero` (use `u-info-section layout="strip"` with
  `u-info-field size="lg"`), and `.hs-sheet-footer` and its parts (use `<u-action-bar sticky>`).

### Guide

- The list screen's saved views are a `u-tab-nav`, the attribute next to an order id is a small tag, and the callouts
  are inline alerts.

## [0.4.0] - 2026-10-14

### Added

- `<kbd>` outside a component takes the keyboard-hint look (border, canvas background, overline size).
- `.hs-table-toolbar__actions` — the action group at the end of a table toolbar.

### Changed

- Requires `@iyulab/components` 2.24.0 or later (peer range `^2.24.0`). The house sets the selection role
  (`--u-selection-color`), which components reads from 2.24.0 — with an older components a checked box, a selected
  radio and an on switch keep the primary colour.


### Deprecated

- **`.hs-page-head` and its parts (`__eyebrow` · `__title` · `__description` · `__actions`) — use `u-page-header`**
  from `@iyulab/modern-app`. The house already draws that component the same way (label-size eyebrow and
  description, display-size title), and it carries the page's `h1`, a back link and a status slot the class pattern
  does not. Move the eyebrow, title and description to its `eyebrow`, `title` and `subtitle` attributes and put each
  scope picker and action in `slot="actions"`. Removed in 0.5.0.
- **`.hs-kbd` — use a plain `<kbd>`.** The house now draws `<kbd>` as the same small outlined cap, in the monospace
  face. Removed in 0.5.0.
- **`.hs-stats` / `.hs-stat` and its parts — use `u-info-section layout="strip"`** with `u-info-field size="lg"`
  (`@iyulab/modern-app` 0.54): `__label` → `label`, `__value` → `value`, `__unit` → `unit`, `__sub` → `description`,
  `--warning` / `--danger` / `--success` → `tone="warning"` / `"negative"` / `"positive"`. The same strip — one surface,
  hairline dividers, all side by side or all stacked below 640px. `.hs-stat--hero` has no counterpart (nothing used it)
  and goes with it. Removed in 0.5.0.
- **`.hs-sheet-footer` and its parts — use `<u-action-bar sticky>`** (`@iyulab/modern-app` 0.54): the change summary in
  `slot="summary"`, Cancel and Save as its children, the sheet's inset as `--action-bar-padding-inline`. It also keeps
  a destructive action apart at the leading edge and puts the main actions on top when narrow. Removed in 0.5.0.

### Fixed

- `.hs-views` no longer draws a vertical scrollbar beside its tabs. The selected tab's underline reached 1px
  past the scrolling strip (a `-1px` margin over the strip's bottom border); the base line is now an inset shadow the
  underline paints over.
- `.hs-table--compact` totals rows take the compact height too. `.hs-table tfoot td` set 40px with a higher
  specificity, so a compact table's subtotal, tax and total rows stood taller than its body rows.
## [0.3.0] - 2026-10-13

### Changed

- 🔴**The house now sets the text between components.** Paragraphs, headings, lists and code spans an application
  writes outside any component drew at the browser's defaults — a 16px body with `line-height: normal`, an `h2` of
  1.5em that outranked every component title, 1em gaps above and below. They now take the house ladder: the body at
  the body step (14px · 1.571), `h1`/`h2`/`h3` at display/title/subtitle, `h4`–`h6` at the body step in semibold;
  one gap below each block (`--u-space-sm` after a heading, `--u-space-md` after a paragraph, list, quote, figure or
  `pre`), none above and none after the last block in its box; `code`, `kbd`, `samp` and `pre` in the house monospace.
  All zero-specificity inside `iyu.house` — your own rules win. A screen that relied on the browser's defaults draws
  smaller and tighter; set your own rule on that element to keep the old look.
- **Native checkboxes, radios and ranges take the selection colour** (`accent-color`), and scrollbars the strong line
  colour (`scrollbar-color`).

### Added

- **House chart colours** — `--u-chart-color-1` … `-8`, light and dark. Slot one is the interaction blue (`#2F6FEB`;
  dark `#628FEA`, the dark blue taken to the mark band), so a one-series chart draws in the colour the screen already
  uses for links, focus and selection; the other seven are muted, warm-leaning hues chosen as a set — neighbours
  ΔE ≥ 15 for full colour vision and ≥ 8 under red–green deficiency, no slot within ΔE 10 of a status colour, every
  dark slot ≥ 3:1 on the surfaces. Light slot six (olive) is 2.8:1 on white: six or more series need a legend or
  labels. Before, the house set no chart colours and series drew in the built-in Material palette. Charts drawn
  through `@iyulab/u-widgets/themes/components.css` pick them up slot for slot.
- `--u-selection-color` / `--u-selection-txt-color` — the mark of a chosen option (a checked box, a selected radio) and
  the check drawn on it: the interaction blue, light and dark, held to 3:1 against the surface and its check.
- `.hs-prose` and `--hs-measure` (70ch) — running text that can grow wider than reads well stops its paragraphs and
  lists at the measure.

### Fixed

- **A hovered table header or toolbar strip is visibly different from its rest state.** `--u-bg-color-raised-hover`
  (light) moves from `#EAEAE7` to `#E5E5E2` — the step from `--u-bg-color-raised` was 0.021 in OKLab lightness, below
  what reads as a change. The token contract now holds state and depth steps to perception floors in both modes
  (hover ≥ 0.03, press ≥ 0.05, selection ≥ 0.03, a surface step ≥ 0.025, which also carries a hairline edge).

### Guide and reference app

- The guide's prose follows the new document-flow layer and stops at the measure; the theme and deployment pages
  take the same page layout as the others; the «Component depth» cards say what the house draws (cards stay flat).
- Both sites follow the system theme (`Theme.init({ default: 'system' })`) and carry a favicon; the reference app
  has a theme toggle.
- Reference app order detail: the items are a `u-rich-table` (the guide's «Line items» pattern) — columns line up,
  quantity edits in place, rows delete from the table — and the add-item line folds in a narrow pane instead of
  scrolling it sideways.

## [0.2.0] - 2026-10-12

### Changed

- 🔴**No size containment.** `.hs-detail` no longer establishes the `hs-detail` container, and the patterns no
  longer use `@container` — in Chromium a size container could stay collapsed after a commit that changed layout
  elsewhere on the page. Each pattern now folds by its own width:
  - `.hs-grid-2` / `.hs-grid-3` drop to one column below 480px of grid width; `.hs-grid-3` shows two columns between
    480px and 728px (it went from three straight to one before). Empty trailing cells are kept, as before.
  - `.hs-stats` stacks when the strip is narrower than 640px — all stats at once, with the dividers turning
    horizontal. Before, a strip outside a size container never stacked.
  - `.hs-detail__cols` puts the side panel (340px) next to the main column when the columns are at least 960px wide.
  If your CSS queried `@container hs-detail`, give that element `container: hs-detail / inline-size` yourself.

## [0.1.5] - 2026-10-09

### Fixed

- **The `@iyulab/modern-app` peer range now starts where the theme takes effect: `>=0.39.0`** (was `>=0.34.0`). The
  theme sets `--app-sidebar-group-active-fg` so a sidebar group header that holds the current page stays readable on
  the theme's light active surface; modern-app reads that property from 0.39.0. With 0.34–0.38 the range allowed it,
  and the header text was derived from the surface instead — about 1.6:1 contrast in light mode.

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
