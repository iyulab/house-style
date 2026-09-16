import { useEffect, useState } from 'react';
import { URichTableReact } from '@iyulab/data-components/react';
import type { ColumnDefReact, FilterState } from '@iyulab/data-components/react';
import { UBadge, UButton, UAlert } from '../lib/ui-react.js';
// 화면 제목·액션 줄·결과 메시지·빈 상태는 손으로 짜지 않는다 — 가이드가 이름을 준 자리다.
import { PageHeader } from '@iyulab/modern-app/react/PageHeader.js';
import { ActionBar } from '@iyulab/modern-app/react/ActionBar.js';
import { EmptyState } from '@iyulab/modern-app/react/EmptyState.js';
import { svc } from '../lib/odata.js';
import NewOrderDrawer from './NewOrderDrawer.js';
import type { Order, OrderStatus } from '../mocks/data.js';

const STATUS_COLOR: Record<OrderStatus, 'neutral' | 'info' | 'success' | 'danger'> = {
  pending: 'neutral',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

// `URichTableReact` widens `render` to accept a React node (that is the whole point of
// `ColumnDefReact` over the vanilla `ColumnDef`) — so this returns JSX through the shared
// `UBadge` wrapper instead of hand-building an element, and the wrapper's own class import
// is what registers `<u-badge>`.
function renderStatusBadge(value: unknown) {
  const status = String(value) as OrderStatus;
  return (
    <UBadge color={STATUS_COLOR[status] ?? 'neutral'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </UBadge>
  );
}

// A hard `location.href` navigation would reload the page — and with it, the MSW mock
// backend's in-memory session (see mocks/handlers.ts) and the Router's client-side state.
// Route client-side instead, same idiom as LoginPage.tsx's post-login redirect.
function navigate(path: string) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// `ColumnDefReact` is not generic — `key` is matched against row properties at runtime, not
// checked against `Order` at compile time (matches the existing house-style Data Patterns
// recipe). The React variant is required here: `URichTableReact.columns` is typed against it.
const COLUMNS: ColumnDefReact[] = [
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
      <PageHeader title="Orders" subtitle={orders ? `${filteredRows.length} of ${orders.length}` : undefined} />

      <ActionBar>
        <UButton slot="danger" disabled={selectedIds.length === 0} onClick={cancelSelected}>
          Cancel selected ({selectedIds.length})
        </UButton>
        <UButton color="primary" onClick={() => setNewOrderOpen(true)}>
          New order
        </UButton>
        <UButton onClick={() => navigate(`${import.meta.env.BASE_URL}app/orders/new`)}>
          New order with items
        </UButton>
      </ActionBar>

      {message && <UAlert open status="success">{message}</UAlert>}

      {/* 가이드가 가르치는 두 갈래를 지킨다 — 데이터가 아예 없는 것(`no-data`)과
          필터가 걸러낸 것(`no-results`)은 사용자에게 다른 상황이고 다음 행동도 다르다.
          `u-rich-table` 은 자기 데이터를 스스로 거르지 않으므로 이 구분도 여기서 한다. */}
      {orders && filteredRows.length === 0 && (
        <EmptyState
          variant={orders.length === 0 ? 'no-data' : 'no-results'}
          title={orders.length === 0 ? 'No orders yet' : 'No orders match these filters'}
          description={orders.length === 0 ? 'Create the first one to get started.' : 'Clear a filter to see more.'}
        />
      )}

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
