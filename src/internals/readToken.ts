/**
 * Reads a design token's current value straight from the live document.
 *
 * This is the whole mechanism behind "cite, don't duplicate": every value shown on
 * this page is read at runtime from whatever this package's theme (`styles/tokens.css`,
 * layered on `@iyulab/components`'s base sheet) currently declares. No token value
 * is ever hand-typed into this codebase, so the page cannot drift from its source.
 */
export function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

let probe: HTMLElement | undefined;
let pixel: CanvasRenderingContext2D | null | undefined;

/**
 * Reads a colour token as the colour the browser draws, `#RRGGBB`. A derived token (`color-mix()`, relative
 * `oklch(from …)`) reads back from `getPropertyValue` as its expression, not a colour; drawing it is the one
 * reading every engine agrees on. Returns '' when the token is unset.
 */
export function readColour(name: string): string {
  if (!readToken(name)) return '';
  if (!probe) {
    probe = document.createElement('span');
    probe.hidden = true;
    document.body.append(probe);
  }
  probe.style.color = `var(${name})`;
  const computed = getComputedStyle(probe).color;
  pixel ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!pixel) return computed;
  pixel.clearRect(0, 0, 1, 1);
  pixel.fillStyle = computed;
  pixel.fillRect(0, 0, 1, 1);
  const [r, g, b] = pixel.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/** WCAG 2.x contrast ratio between two `#RRGGBB` colours. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
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
