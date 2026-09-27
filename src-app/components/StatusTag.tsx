import { UTag } from '../lib/ui-react.js';
import type { OrderStatus } from '../mocks/data.js';

/**
 * The guide's "Status → tag convention", in one place. The list and the detail screen used to map
 * status to colour on their own and disagreed — the detail screen showed a lowercase, neutral
 * `pending` next to the list's `Pending` — so a status looked different depending on where you saw it.
 * A status is a label, so it is a tinted `u-tag`, not a `u-badge` (counts and notifications).
 */
const STATUS_COLOR: Record<OrderStatus, 'gray' | 'info' | 'success' | 'danger'> = {
  pending: 'gray',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function StatusTag({ status, slot }: { status: OrderStatus; slot?: string }) {
  return (
    <UTag slot={slot} variant="filled" color={STATUS_COLOR[status] ?? 'neutral'}>
      {STATUS_LABEL[status] ?? status}
    </UTag>
  );
}
