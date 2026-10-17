import { formatCurrency } from '@iyulab/components/dist/utilities/format.js';

/**
 * An amount in won, in the app's locale — the same formatter `InfoField format="currency"` uses, so a total reads
 * the same in a table cell, a card and a summary field.
 */
export function won(value: unknown): string {
  return formatCurrency(Number(value), 'KRW');
}
