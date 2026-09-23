import { useEffect, useState } from 'react';
import '@iyulab/modern-app/dist/components/MasterDetailLayout.js';
// 하우스 스타일이 «화면을 무엇으로 조립하는가» 로 가르치는 프리미티브들 — 가이드(`src/`)가
// 227회 쓰는 동안 이 레퍼런스 앱은 0회 썼고, 그 어긋남을 `예제 정합` 자가 지목했다.
import { PageHeader } from '@iyulab/modern-app/react/PageHeader.js';
import { InfoSection } from '@iyulab/modern-app/react/InfoSection.js';
import { InfoField } from '@iyulab/modern-app/react/InfoField.js';
import { GroupBox } from '@iyulab/modern-app/react/GroupBox.js';
import { EmptyState } from '@iyulab/modern-app/react/EmptyState.js';
import { ActionBar } from '@iyulab/modern-app/react/ActionBar.js';
import { FormSection, FormRow } from '@iyulab/enterprise';
import { UButton, UBadge, UInput, USelect, UDrawer, UAlert } from '../lib/ui-react.js';
import type { UInput as UInputElement, USelect as USelectElement } from '@iyulab/components';
import ItemEntryForm, { type ItemEntryFormLine } from '../components/ItemEntryForm.js';
import { svc } from '../lib/odata.js';
import { usePermission } from '../lib/permissions.js';
import type { Order, OrderStatus, OrderItem, Product } from '../mocks/data.js';

// The edit form's Status choices deliberately exclude "cancelled" — cancelling is a separate,
// one-way destructive action (the button below), not a step in the normal fulfillment flow
// this select edits. Matches the house-style guide's own "Edit form" recipe (Data Patterns).
const EDITABLE_STATUSES: OrderStatus[] = ['pending', 'shipped', 'delivered'];

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
      <div style={{ padding: 'var(--u-space-md, 16px)' }}>
        {orders.map((o) => (
          <a
            key={o.Id}
            href={`${import.meta.env.BASE_URL}app/orders/${o.Id}`}
            style={{ display: 'block', padding: 'var(--u-space-sm, 10px) 0', fontWeight: o.Id === orderId ? 600 : 400 }}
          >
            {o.Id} — {o.Customer}
          </a>
        ))}
      </div>
      <div slot="detail" style={{ padding: 'var(--u-space-lg, 18px)' }}>
        {order ? (
          <>
            <PageHeader title={order.Id} subtitle={order.Customer}>
              <UBadge slot="status" color={order.Status === 'cancelled' ? 'danger' : 'neutral'}>
                {order.Status}
              </UBadge>
            </PageHeader>

            <InfoSection min={200}>
              <InfoField label="Total" format="currency" currency="KRW" value={order.Total} />
              <InfoField label="Items" value={items.length} />
            </InfoSection>

            {canEdit && order.Status !== 'cancelled' && (
              <ActionBar>
                <UButton slot="danger" color="danger" onClick={cancelOrder}>Cancel order</UButton>
                <UButton color="primary" onClick={openEdit}>Edit order</UButton>
              </ActionBar>
            )}

            {/* The count is `meta`, not part of the title: it states how many lines there are right now,
                one step below the section's name. Omitted at zero — the empty state already says so. */}
            <GroupBox
              level={2}
              title="Items"
              meta={items.length === 0 ? undefined : `${items.length} ${items.length === 1 ? 'item' : 'items'}`}
            >
              {items.length === 0 && (
                <EmptyState
                  variant="no-data"
                  title="No items yet"
                  description={canEdit ? 'Add the first line below.' : 'Nothing has been added to this order.'}
                />
              )}
              {items.map((item) => (
                <div
                  key={item.Id}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--u-space-md, 16px)', alignItems: 'center', padding: 'var(--u-space-sm, 10px) 0' }}
                >
                  {/* A flexible name with a floor: without `flex-wrap` + a basis the name is the only thing
                      that can shrink, so on a phone it collapses to a few pixels and wraps one letter per
                      line. With them the name takes its own line once the row no longer fits. */}
                  <span style={{ flex: '1 1 10rem', minWidth: 0 }}>{item.ProductName}</span>
                  <UInput
                    type="number"
                    label="Quantity"
                    value={String(item.Quantity)}
                    disabled={!canEdit || order.Status === 'cancelled'}
                    onChange={(e) => {
                      const q = Number((e.target as UInputElement).value);
                      if (q > 0) updateItemQuantity(item.Id, q);
                    }}
                  />
                  <span>₩{(item.Quantity * item.UnitPrice).toLocaleString()}</span>
                  {canEdit && order.Status !== 'cancelled' && (
                    <UButton color="danger" onClick={() => removeItem(item.Id)}>Remove</UButton>
                  )}
                </div>
              ))}
              {canEdit && order.Status !== 'cancelled' && (
                <ItemEntryForm products={products} onAdd={addItem} />
              )}
              {itemsError && <UAlert open status="error">{itemsError}</UAlert>}
            </GroupBox>

            <UDrawer
              open={editOpen}
              placement="right"
              closable
              onHide={() => setEditOpen(false)}
            >
              <span slot="header">Edit order {order.Id}</span>
              <FormSection title="Details">
                <FormRow full>
                  <UInput
                    label="Customer"
                    value={editCustomer}
                    disabled={saving}
                    onChange={(e) => setEditCustomer((e.target as UInputElement).value ?? '')}
                  />
                </FormRow>
                <FormRow full>
                  <USelect
                    label="Status"
                    value={editStatus}
                    disabled={saving}
                    onChange={(e) => setEditStatus((e.target as USelectElement).value as OrderStatus)}
                  >
                    {EDITABLE_STATUSES.map((s) => (
                      <u-option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</u-option>
                    ))}
                  </USelect>
                </FormRow>
                <FormRow full>
                  <UInput label="Total" description="Read-only — set from the order's items" value={`₩${order.Total.toLocaleString()}`} disabled />
                </FormRow>
              </FormSection>
              {saveError && <UAlert open status="error">{saveError}</UAlert>}
              <div slot="footer" style={{ display: 'flex', gap: 'var(--u-space-md, 16px)' }}>
                <UButton onClick={() => setEditOpen(false)} disabled={saving}>Cancel</UButton>
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
