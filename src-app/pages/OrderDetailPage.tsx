import { useEffect, useState } from 'react';
import '@iyulab/modern-app/dist/components/MasterDetailLayout.js';
// 하우스 스타일이 «화면을 무엇으로 조립하는가» 로 가르치는 프리미티브들 — 가이드(`src/`)가
// 227회 쓰는 동안 이 레퍼런스 앱은 0회 썼고, 그 어긋남을 `예제 정합` 자가 지목했다.
import { PageHeader } from '@iyulab/modern-app/react/PageHeader.js';
import { StatusTag, STATUS_COLOR, STATUS_LABEL } from '../components/StatusTag.js';
import { Dialog } from '@iyulab/components/dist/utilities/Dialog.js';
import './OrderDetailPage.css';
import { InfoSection } from '@iyulab/modern-app/react/InfoSection.js';
import { InfoField } from '@iyulab/modern-app/react/InfoField.js';
import { GroupBox } from '@iyulab/modern-app/react/GroupBox.js';
import { EmptyState } from '@iyulab/modern-app/react/EmptyState.js';
import { ActionBar } from '@iyulab/modern-app/react/ActionBar.js';
import { Timeline } from '@iyulab/modern-app/react/Timeline.js';
import { TimelineItem } from '@iyulab/modern-app/react/TimelineItem.js';
import { FormSection, FormRow } from '@iyulab/enterprise/react';
import { UButton, UInput, USelect, UDrawer, UAlert } from '../lib/ui-react.js';
import type { UInput as UInputElement, USelect as USelectElement } from '@iyulab/components';
import ItemEntryForm, { type ItemEntryFormLine } from '../components/ItemEntryForm.js';
import { URichTableReact } from '@iyulab/data-components/react';
import type { ColumnDef } from '@iyulab/data-components';
import { svc } from '../lib/odata.js';
import { usePermission } from '../lib/permissions.js';
import { useDiscardableForm } from '../lib/unsaved.js';
import { won } from '../lib/money.js';
import type { Order, OrderStatus, OrderItem, Product } from '../mocks/data.js';

// The edit form's Status choices deliberately exclude "cancelled" — cancelling is a separate,
// one-way destructive action (the button below), not a step in the normal fulfillment flow
// this select edits. Matches the house-style guide's own "Edit form" recipe (Data Patterns).
const EDITABLE_STATUSES: OrderStatus[] = ['pending', 'shipped', 'delivered'];

// The guide's «Line items» pattern (Data patterns): a group box holding a rich table, with the columns
// trimmed to what belongs on a line. Quantity is the one editable cell — double-click or Enter edits it.
function lineItemColumns(editable: boolean): ColumnDef[] {
  return [
    { key: 'ProductName', label: 'Item', minWidth: '12rem' },
    {
      key: 'Quantity', label: 'Qty', type: 'number', width: '96px', editable,
      validator: (v) => (Number(v) > 0 && Number.isInteger(Number(v)) ? null : 'Enter a whole number above 0'),
    },
    { key: 'UnitPrice', label: 'Unit price', align: 'end', width: '128px', render: won },
    { key: 'Amount', label: 'Amount', align: 'end', width: '136px', render: won },
  ];
}

function itemsTotal(items: OrderItem[]): number {
  return items.reduce((sum, i) => sum + i.Quantity * i.UnitPrice, 0);
}

function describeError(e: unknown): string {
  return e instanceof svc.ApiError
    ? e.message
    : 'Could not reach the server. Check your connection and try again.';
}

export default function OrderDetailPage({ orderId }: { orderId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const canEdit = usePermission('orders.write');

  const [editOpen, setEditOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState('');
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [itemsError, setItemsError] = useState('');

  // The edit drawer holds unsaved input once a field differs from the order — leaving the screen or closing the
  // drawer asks first (Discard / Keep editing) instead of dropping it.
  const editDirty = editOpen && !!order && (editCustomer !== order.Customer || editStatus !== order.Status);
  const editForm = useDiscardableForm(editDirty, () => setEditOpen(false));

  async function fetchItems(): Promise<OrderItem[]> {
    return svc.odataGet<OrderItem>('OrderItems', { $filter: `OrderId eq '${orderId}'` });
  }

  async function reload() {
    const [list, current, currentItems] = await Promise.all([
      svc.odataGet<Order>('Orders'),
      svc.odataGetById<Order>('Orders', orderId),
      fetchItems(),
    ]);
    setOrders(list);
    setOrder(current);
    setItems(currentItems);
  }

  useEffect(() => { reload(); }, [orderId]);
  useEffect(() => { svc.odataGet<Product>('Products').then(setProducts); }, []);

  async function syncTotal(nextItems: OrderItem[]) {
    const total = itemsTotal(nextItems);
    await svc.odataPatch<Order>('Orders', orderId, { Total: total });
    setOrder((prev) => (prev ? { ...prev, Total: total } : prev));
  }

  async function addItem(line: ItemEntryFormLine) {
    setItemsError('');
    try {
      // Quiet — svc.odataPost would toast "Order created" (the service's shared wording is
      // Order-specific), which is wrong for adding a line item. The item appearing in the
      // list below is the feedback instead.
      await svc.odataPostQuiet<OrderItem>('OrderItems', {
        OrderId: orderId,
        ProductId: line.productId,
        ProductName: line.productName,
        Quantity: line.quantity,
        UnitPrice: line.unitPrice,
      });
      const nextItems = await fetchItems();
      setItems(nextItems);
      await syncTotal(nextItems);
    } catch (e) {
      setItemsError(describeError(e));
    }
  }

  async function updateItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) return;
    setItemsError('');
    try {
      await svc.odataPatch<OrderItem>('OrderItems', itemId, { Quantity: quantity });
      const nextItems = await fetchItems();
      setItems(nextItems);
      await syncTotal(nextItems);
    } catch (e) {
      setItemsError(describeError(e));
    }
  }

  async function removeItem(itemId: string) {
    setItemsError('');
    try {
      await svc.odataDelete('OrderItems', itemId);
      const nextItems = await fetchItems();
      setItems(nextItems);
      await syncTotal(nextItems);
    } catch (e) {
      setItemsError(describeError(e));
    }
  }

  async function cancelOrder() {
    if (!order) return;
    const ok = await Dialog.confirm(`Cancel order ${order.Id}? This cannot be undone.`, {
      title: 'Cancel order',
      confirmLabel: 'Cancel order',
      cancelLabel: 'Keep order',
      confirmColor: 'danger',
    });
    if (!ok) return;
    await svc.odataPatch<Order>('Orders', order.Id, { Status: 'cancelled' });
    await reload();
  }

  function openEdit() {
    if (!order) return;
    setEditCustomer(order.Customer);
    setEditStatus(order.Status);
    setSaveError('');
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!order) return;
    setSaving(true);
    setSaveError('');
    try {
      await svc.odataPatch<Order>('Orders', order.Id, { Customer: editCustomer.trim(), Status: editStatus });
      await reload();
      setEditOpen(false);
    } catch (e) {
      setSaveError(describeError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <u-master-detail-layout master-size="20rem">
      {/* Default (unnamed) slot = the master pane; the detail pane is the named "detail"
          slot below — confirmed against MasterDetailLayout's own template, which is the
          reverse of what the prop names might suggest at a glance. */}
      <nav className="order-master" aria-label="Orders">
        {orders.map((o) => (
          <a
            key={o.Id}
            className="order-master__item"
            href={`${import.meta.env.BASE_URL}app/orders/${o.Id}`}
            aria-current={o.Id === orderId ? 'page' : undefined}
          >
            <span className="order-master__text">
              <span className="order-master__id">{o.Id}</span>
              <span className="order-master__customer">{o.Customer}</span>
            </span>
            <StatusTag status={o.Status} />
          </a>
        ))}
      </nav>
      <div slot="detail" style={{ padding: 'var(--u-space-lg, 18px)' }}>
        {order ? (
          <>
            <PageHeader title={order.Id} subtitle={order.Customer}>
              <StatusTag slot="status" status={order.Status} />
            </PageHeader>

            <InfoSection min={200}>
              <InfoField label="Total" format="currency" currency="KRW" value={order.Total} />
              <InfoField label="Items" value={items.length} />
            </InfoSection>

            {canEdit && order.Status !== 'cancelled' && (
              <ActionBar>
                <UButton slot="danger" color="danger" appearance="outlined" onClick={cancelOrder}>Cancel order</UButton>
                <UButton color="primary" onClick={openEdit}>Edit order</UButton>
              </ActionBar>
            )}

            {/* What happened to the order, newest first. The mock records only when it was placed and where
                it is now, so the current status carries no time — a history never shows a time it does not know. */}
            <GroupBox level={2} title="History">
              <Timeline>
                {order.Status !== 'pending' && (
                  <TimelineItem heading={STATUS_LABEL[order.Status]} color={STATUS_COLOR[order.Status]} />
                )}
                <TimelineItem heading="Ordered" datetime={order.CreatedAt} />
              </Timeline>
            </GroupBox>

            {/* The count is `meta`, not part of the title: it states how many lines there are right now,
                one step below the section's name ("lines", not a second "items"). Omitted at zero — the
                empty state already says so. */}
            <GroupBox
              level={2}
              title="Items"
              meta={items.length === 0 ? undefined : `${items.length} ${items.length === 1 ? 'line' : 'lines'}`}
            >
              {items.length === 0 && (
                <EmptyState
                  variant="no-data"
                  title="No items yet"
                  description={canEdit ? 'Add the first line below.' : 'Nothing has been added to this order.'}
                />
              )}
              {items.length > 0 && (
                <URichTableReact
                  aria-label="Order items"
                  rowKey="Id"
                  dataMode="client"
                  hidePagination
                  columns={lineItemColumns(canEdit && order.Status !== 'cancelled')}
                  data={items.map((i) => ({ ...i, Amount: i.Quantity * i.UnitPrice }))}
                  deletable={canEdit && order.Status !== 'cancelled'}
                  onRowUpdate={(e) => {
                    if (e.detail.field === 'Quantity') updateItemQuantity(String(e.detail.row.Id), Number(e.detail.value));
                  }}
                  onRowDelete={(e) => removeItem(String(e.detail.row.Id))}
                />
              )}
              {canEdit && order.Status !== 'cancelled' && (
                <ItemEntryForm products={products} onAdd={addItem} />
              )}
              {itemsError && <UAlert open status="error">{itemsError}</UAlert>}
            </GroupBox>

            <UDrawer
              open={editOpen}
              placement="right"
              closable
              onHide={editForm.onHide}
            >
              <span slot="header">Edit order {order.Id}</span>
              <fieldset disabled={saving} style={{ display: 'contents' }}>
              <FormSection title="Details">
                <FormRow full>
                  <UInput
                    label="Customer"
                    value={editCustomer}
                    onInput={(e) => setEditCustomer((e.target as UInputElement).value ?? '')}
                  />
                </FormRow>
                <FormRow full>
                  <USelect
                    label="Status"
                    value={editStatus}
                    onChange={(e) => setEditStatus((e.target as USelectElement).value as OrderStatus)}
                  >
                    {EDITABLE_STATUSES.map((s) => (
                      <u-option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</u-option>
                    ))}
                  </USelect>
                </FormRow>
                <FormRow full>
                  <UInput label="Total" description="Read-only — set from the order's items" value={won(order.Total)} disabled />
                </FormRow>
              </FormSection>
              </fieldset>
              {saveError && <UAlert open status="error">{saveError}</UAlert>}
              <div slot="footer" style={{ display: 'flex', gap: 'var(--u-space-md, 16px)' }}>
                <UButton appearance="plain" onClick={editForm.cancel} disabled={saving}>Cancel</UButton>
                <UButton color="primary" onClick={saveEdit} loading={saving} disabled={saving}>
                  Save
                </UButton>
              </div>
            </UDrawer>
          </>
        ) : (
          <p>Loading…</p>
        )}
      </div>
    </u-master-detail-layout>
  );
}
