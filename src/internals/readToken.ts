/**
 * Reads a design token's current value straight from the live document.
 *
 * This is the whole mechanism behind "cite, don't duplicate": every value shown on
 * this page is read at runtime from whatever `@iyulab/enterprise/styles/preset.css`
 * (layered on `@iyulab/components`'s base sheet) currently declares. No token value
 * is ever hand-typed into this codebase, so the page cannot drift from its source.
 */
export function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** A named group of CSS custom-property suffixes read as one row, e.g. a type stage. */
export interface TokenRow {
  label: string;
  properties: Array<{ suffix: string; token: string }>;
}

/**
 * Builds the rows for a typography-scale table: each stage's size/weight/leading/tracking,
 * read live so the table always reflects the sheet actually loaded by this page.
 */
export function typographyRows(stages: readonly string[]): TokenRow[] {
  return stages.map(stage => ({
    label: stage,
    properties: ['size', 'weight', 'leading', 'tracking'].map(suffix => ({
      suffix,
      token: `--u-text-${stage}-${suffix}`,
    })),
  }));
}
