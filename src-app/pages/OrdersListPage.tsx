import { useEffect, useState } from 'react';
import { URichTableReact } from '@iyulab/data-components/react';
import type { ColumnDef, FilterState } from '@iyulab/data-components/react';
// `renderStatusBadge` below builds a raw `<u-badge>` element (URichTable's column `render`
// expects an HTMLElement, not a React node) — this side-effect import registers the custom
// element; without it `<u-badge>` renders as an unstyled unknown element.
import '@iyulab/components/dist/components/badge/UBadge.js';
import { UButton } from '../lib/ui-react.js';
import { svc } from '../lib/odata.js';
import NewOrderDrawer from './NewOrderDrawer.js';
import type { Order, OrderStatus } from '../mocks/data.js';

const STATUS_COLOR: Record<OrderStatus, 'neutral' | 'info' | 'success' | 'danger'> = {
  pending: 'neutral',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

function renderStatusBadge(value: unknown): HTMLElement {
  const status = String(value) as OrderStatus;
  const badge = document.createElement('u-badge');
  badge.setAttribute('color', STATUS_COLOR[status] ?? 'neutral');
  badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  return badge;
}

// A hard `location.href` navigation would reload the page — and with it, the MSW mock
// backend's in-memory session (see mocks/handlers.ts) and the Router's client-side state.
// Route client-side instead, same idiom as LoginPage.tsx's post-login redirect.
function navigate(path: string) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// `ColumnDef` is not generic — `key` is matched against row properties at runtime, not checked
// against `Order` at compile time (matches the existing house-style Data Patterns recipe).
const COLUMNS: ColumnDef[] = [
  { key: 'Id', label: 'Order', width: '140px' },
  { key: 'Customer', label: 'Customer', width: '200px', filterable: true, filterType: 'text' },
  {
    key: 'Status', label: 'Status', width: '120px',
    filterable: true, filterType: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'shipped', label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
    render: renderStatusBadge,
  },
  { key: 'Total', label: 'Total', width: '140px', align: 'right', render: (v) => `₩${Number(v).toLocaleString()}` },
];

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  // `u-rich-table` renders the filter row and emits `filter-change` but does not filter its
  // own `data` (the component leaves that to the consumer, so a server-backed table can turn a
  // filter into an API query instead of a client-side operation). This demo's data is static,
  // so filtering happens here — same shape as the existing house-style Data Patterns recipe.
  const [filters, setFilters] = useState<FilterState>({});
  // `selection-change`'s `detail.selectedIds` is cumulative across every filter/page visited so
  // far (confirmed against the component's source) — this page just displays that count,
  // instead of re-deriving a "which rows are checked right now" set itself.
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  async function reload() {
    const rows = await svc.odataGet<Order>('Orders');
    setOrders(rows);
  }

  useEffect(() => { reload(); }, []);

  const filteredRows = (orders ?? []).filter((row) =>
    Object.entries(filters).every(([field, value]) => {
      if (!value) return true;
      const cell = String((row as unknown as Record<string, unknown>)[field] ?? '');
      const column = COLUMNS.find((c) => c.key === field);
      return column?.filterType === 'select' ? cell === value : cell.toLowerCase().includes(value.toLowerCase());
    }),
  );

  async function cancelSelected() {
    const ids = selectedIds;
    await Promise.all(ids.map((id) => svc.odataPatch<Order>('Orders', id, { Status: 'cancelled' })));
    // Clear selection, then reload, then set the message — in that order, so the confirmation
    // text never appears before the table has visibly updated.
    setSelectedIds([]);
    await reload();
    setMessage(`Cancelled ${ids.length} order(s).`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--u-space-md, 16px)' }}>
      <div style={{ display: 'flex', gap: 'var(--u-space-md, 16px)', alignItems: 'center' }}>
        <UButton disabled={selectedIds.length === 0} onClick={cancelSelected}>
          Cancel selected ({selectedIds.length})
        </UButton>
        <UButton color="primary" onClick={() => setNewOrderOpen(true)}>
          New order
        </UButton>
        <UButton onClick={() => navigate(`${import.meta.env.BASE_URL}app/orders/new`)}>
          New order with items
        </UButton>
        {message && <span>{message}</span>}
      </div>

      <URichTableReact
        data={filteredRows as unknown as Record<string, unknown>[]}
        columns={COLUMNS}
        selectable
        filterable
        onFilterChange={(e) => { setFilters(e.detail.filters); setMessage(''); }}
        onSelectionChange={(e) => { setSelectedIds(e.detail.selectedIds); setMessage(''); }}
        onRowActivate={(e) => navigate(`${import.meta.env.BASE_URL}app/orders/${e.detail.id}`)}
      />

      <NewOrderDrawer
        open={newOrderOpen}
        onClose={() => setNewOrderOpen(false)}
        onCreated={reload}
      />
    </div>
  );
}
