import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createODataSource } from '@iyulab/flex-table/odata';
import { ListPage } from '@iyulab/enterprise/react';
import { URichTableReact, UDataViewReact } from '@iyulab/data-components/react';
import type { ColumnDefReact } from '@iyulab/data-components/react';
import type { USelect as USelectElement } from '@iyulab/components';
import { UButton, UAlert, UInput, USelect, UPagination } from '../lib/ui-react.js';
// 화면 제목·액션 줄·결과 메시지·빈 상태는 손으로 짜지 않는다 — 가이드가 이름을 준 자리다.
import { PageHeader } from '@iyulab/modern-app/react/PageHeader.js';
import { ActionBar } from '@iyulab/modern-app/react/ActionBar.js';
import { EmptyState } from '@iyulab/modern-app/react/EmptyState.js';
import { svc } from '../lib/odata.js';
import NewOrderDrawer from './NewOrderDrawer.js';
import { StatusTag } from '../components/StatusTag.js';
import { Dialog } from '@iyulab/components/dist/utilities/Dialog.js';
import type { Order, OrderStatus } from '../mocks/data.js';

// A hard `location.href` navigation would reload the page — and with it the MSW mock backend's in-memory orders.
function navigate(path: string) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

const COLUMNS: ColumnDefReact[] = [
  { key: 'Id', label: 'Order', width: '140px', sortable: true },
  { key: 'Customer', label: 'Customer', width: '200px', sortable: true },
  { key: 'Status', label: 'Status', width: '120px', render: (v) => <StatusTag status={String(v) as OrderStatus} /> },
  { key: 'Total', label: 'Total', width: '140px', align: 'end', sortable: true, render: (v) => `₩${Number(v).toLocaleString()}` },
];

/**
 * The orders list — `ListPage` binds one OData source (the server pages, sorts and searches) to the table, the cards
 * and the pager. The screen holds only what is its own: the status criterion, the view, the selection.
 */
export default function OrdersListPage() {
  const orders = useMemo(() => createODataSource<Order>('/$data/Orders', { pageSize: 5, defaultOrderBy: 'CreatedAt desc' }), []);
  const { totalCount, search } = useSyncExternalStore(orders.subscribe, orders.getState);
  const [status, setStatus] = useState('');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  useEffect(() => {
    orders.update('/$data/Orders', { pageSize: 5, defaultOrderBy: 'CreatedAt desc', fixedFilter: status ? { Status: status } : undefined });
  }, [orders, status]);

  async function cancelSelected() {
    const ids = selectedIds;
    // Irreversible, so it runs only from a confirmation — the one place it is drawn solid.
    const ok = await Dialog.confirm(`Cancel ${ids.length} order(s)? This cannot be undone.`, {
      title: 'Cancel orders', confirmLabel: 'Cancel orders', cancelLabel: 'Keep orders', confirmColor: 'danger',
    });
    if (!ok) return;
    await Promise.all(ids.map((id) => svc.odataPatch<Order>('Orders', id, { Status: 'cancelled' })));
    setSelectedIds([]);
    orders.refresh();
    setMessage(`Cancelled ${ids.length} order(s).`);
  }

  return (
    <ListPage source={orders} view={view}>
      <PageHeader slot="header" title="Orders" subtitle={`${totalCount} order(s)`} />
      <UInput slot="filters" type="search" label="Search" placeholder="Order or customer" />
      <USelect slot="filters" label="Status" value={status} onChange={(e) => setStatus(String((e.target as USelectElement).value ?? ''))}>
        <u-option value="">All statuses</u-option>
        <u-option value="pending">Pending</u-option>
        <u-option value="shipped">Shipped</u-option>
        <u-option value="delivered">Delivered</u-option>
        <u-option value="cancelled">Cancelled</u-option>
      </USelect>
      <ActionBar slot="toolbar">
        <UButton appearance="outlined" aria-pressed={view === 'cards'} onClick={() => setView(view === 'table' ? 'cards' : 'table')}>Cards</UButton>
        <UButton slot="danger" color="danger" appearance="outlined" disabled={selectedIds.length === 0} onClick={cancelSelected}>
          Cancel selected ({selectedIds.length})
        </UButton>
        <UButton color="primary" onClick={() => setNewOrderOpen(true)}>New order</UButton>
        <UButton appearance="outlined" onClick={() => navigate(`${import.meta.env.BASE_URL}app/orders/new`)}>New order with items</UButton>
      </ActionBar>
      {message && <UAlert slot="toolbar" open status="success">{message}</UAlert>}
      <URichTableReact slot="view" view-name="table" aria-label="Orders" columns={COLUMNS} selectable hidePagination
        onSelectionChange={(e) => { setSelectedIds(e.detail.selectedIds); setMessage(''); }}
        onRowActivate={(e) => navigate(`${import.meta.env.BASE_URL}app/orders/${e.detail.id}`)} />
      <UDataViewReact slot="view" view-name="cards" hideToolbar
        renderCard={(o) => <><strong>{String(o.Customer)}</strong> <StatusTag status={o.Status as OrderStatus} /><div><small>{String(o.Id)} · ₩{Number(o.Total).toLocaleString()}</small></div></>}
        onRowActivate={(e) => navigate(`${import.meta.env.BASE_URL}app/orders/${e.detail.id}`)} />
      <UPagination slot="pager" label="Orders pages" />
      {/* 데이터가 아예 없는 것과 조건이 걸러낸 것은 다음 행동이 다르다 — 화면이 자기 조건을 보고 고른다. */}
      <EmptyState slot="empty" {...(search || status
        ? { variant: 'no-results', title: 'No orders match', description: 'Clear the search or the status to see more.' }
        : { variant: 'no-data', title: 'No orders yet', description: 'Create the first one to get started.' })} />
      <NewOrderDrawer open={newOrderOpen} onClose={() => setNewOrderOpen(false)} onCreated={() => orders.refresh()} />
    </ListPage>
  );
}
