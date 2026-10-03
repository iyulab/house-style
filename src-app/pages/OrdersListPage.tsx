import { useEffect, useRef, useState } from 'react';
import { URichTableReact } from '@iyulab/data-components/react';
import type { ColumnDefReact } from '@iyulab/data-components/react';
import type { URichTable } from '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import { UButton, UAlert } from '../lib/ui-react.js';
// 화면 제목·액션 줄·결과 메시지·빈 상태는 손으로 짜지 않는다 — 가이드가 이름을 준 자리다.
import { PageHeader } from '@iyulab/modern-app/react/PageHeader.js';
import { ActionBar } from '@iyulab/modern-app/react/ActionBar.js';
import { EmptyState } from '@iyulab/modern-app/react/EmptyState.js';
import { svc } from '../lib/odata.js';
import NewOrderDrawer from './NewOrderDrawer.js';
import { StatusTag } from '../components/StatusTag.js';
import { Dialog } from '@iyulab/components/dist/utilities/Dialog.js';
import type { Order, OrderStatus } from '../mocks/data.js';

// `URichTableReact` widens `render` to accept a React node (that is the whole point of
// `ColumnDefReact` over the vanilla `ColumnDef`) — so this returns the shared badge as JSX.
function renderStatusTag(value: unknown) {
  return <StatusTag status={String(value) as OrderStatus} />;
}

// A hard `location.href` navigation would reload the page — and with it, the MSW mock
// backend's in-memory orders (see mocks/handlers.ts) and the Router's client-side state.
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
    render: renderStatusTag,
  },
  { key: 'Total', label: 'Total', width: '140px', align: 'end', render: (v) => `₩${Number(v).toLocaleString()}` },
];

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  // The whole list is loaded, so the table filters it itself (`dataMode="client"`). The page only
  // keeps the count for its subtitle and empty state: `filter-change` reports it when a filter
  // changes, and `filteredRowCount` is read after new data has reached the table.
  const tableRef = useRef<URichTable>(null);
  const [filteredCount, setFilteredCount] = useState(0);
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
  // Runs after the commit that handed `orders` to the table, so the getter sees the new rows.
  useEffect(() => { if (tableRef.current) setFilteredCount(tableRef.current.filteredRowCount); }, [orders]);

  async function cancelSelected() {
    const ids = selectedIds;
    // Irreversible, so it runs only from a confirmation — the one place it is drawn solid (the
    // guide's action hierarchy). The page button stays outlined.
    const ok = await Dialog.confirm(`Cancel ${ids.length} order(s)? This cannot be undone.`, {
      title: 'Cancel orders',
      confirmLabel: 'Cancel orders',
      cancelLabel: 'Keep orders',
      confirmColor: 'danger',
    });
    if (!ok) return;
    await Promise.all(ids.map((id) => svc.odataPatch<Order>('Orders', id, { Status: 'cancelled' })));
    // Clear selection, then reload, then set the message — in that order, so the confirmation
    // text never appears before the table has visibly updated.
    setSelectedIds([]);
    await reload();
    setMessage(`Cancelled ${ids.length} order(s).`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--u-space-md, 16px)' }}>
      <PageHeader title="Orders" subtitle={orders ? `${filteredCount} of ${orders.length}` : undefined} />

      <ActionBar>
        <UButton slot="danger" color="danger" appearance="outlined" disabled={selectedIds.length === 0} onClick={cancelSelected}>
          Cancel selected ({selectedIds.length})
        </UButton>
        <UButton color="primary" onClick={() => setNewOrderOpen(true)}>
          New order
        </UButton>
        <UButton appearance="outlined" onClick={() => navigate(`${import.meta.env.BASE_URL}app/orders/new`)}>
          New order with items
        </UButton>
      </ActionBar>

      {message && <UAlert open status="success">{message}</UAlert>}

      {/* 가이드가 가르치는 두 갈래 — 데이터가 아예 없는 것(`no-data`)과 필터가 걸러낸 것은
          다른 상황이고 다음 행동도 다르다. 앞의 것은 화면의 빈 상태가, 뒤의 것은 표가 방금
          입력한 필터 바로 아래에서 말한다(`noMatchMessage`) — 같은 안내를 두 곳에 두지 않는다. */}
      {orders && orders.length === 0 && (
        <EmptyState variant="no-data" title="No orders yet" description="Create the first one to get started." />
      )}

      <URichTableReact
        ref={tableRef}
        dataMode="client"
        data={(orders ?? []) as unknown as Record<string, unknown>[]}
        columns={COLUMNS}
        noMatchMessage="No orders match these filters — clear a filter to see more."
        selectable
        filterable
        onFilterChange={(e) => { setFilteredCount(e.detail.filteredCount ?? 0); setMessage(''); }}
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
