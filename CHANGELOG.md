# Changelog

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
