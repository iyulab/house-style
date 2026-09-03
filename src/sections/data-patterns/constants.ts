import type { ColumnDef } from '@iyulab/data-components/dist/components/u-rich-table/types.js';

export const COLUMNS: ColumnDef[] = [
  { key: 'id', label: 'Order', width: '120px' },
  { key: 'customer', label: 'Customer', filterable: true, filterType: 'text' },
  {
    key: 'status', label: 'Status', width: '140px',
    filterable: true, filterType: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'shipped', label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
    ],
    render: renderStatusBadge,
  },
  { key: 'total', label: 'Total', align: 'right', width: '120px' },
];

const STATUS_BADGE_COLOR: Record<string, 'neutral' | 'info' | 'success'> = {
  pending: 'neutral',
  shipped: 'info',
  delivered: 'success',
};

export function renderStatusBadge(value: unknown): HTMLElement {
  const status = String(value);
  const badge = document.createElement('u-badge');
  badge.setAttribute('color', STATUS_BADGE_COLOR[status] ?? 'neutral');
  badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  return badge;
}

export const ROWS = [
  { _id: '1', id: 'G-2026-0512', customer: 'Aster Trading', status: 'pending', total: '₩1,240,000' },
  { _id: '2', id: 'G-2026-0513', customer: 'Blue Harbor Co.', status: 'shipped', total: '₩380,500' },
  { _id: '3', id: 'G-2026-0514', customer: 'Cedar & Finch', status: 'delivered', total: '₩92,000' },
  { _id: '4', id: 'G-2026-0515', customer: 'Aster Trading', status: 'pending', total: '₩2,010,000' },
];

export const PAGED_PAGE_SIZE = 5;
export const PAGED_ROWS = Array.from({ length: 12 }, (_, i) => ({
  _id: `p-${i + 1}`,
  id: `G-2026-${(600 + i).toString().padStart(4, '0')}`,
  customer: ['Aster Trading', 'Blue Harbor Co.', 'Cedar & Finch', 'Driftwood Supply'][i % 4],
  status: ['pending', 'shipped', 'delivered'][i % 3],
  total: `₩${((i + 1) * 87000).toLocaleString()}`,
}));
