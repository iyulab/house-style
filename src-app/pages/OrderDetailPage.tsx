import { useEffect, useState, type ReactNode } from 'react';
import '@iyulab/modern-app/dist/components/MasterDetailLayout.js';
import { FormSection, FormRow } from '@iyulab/enterprise';
import { UButton, UBadge, UInput, USelect, UDrawer } from '../lib/ui-react.js';
import type { UInput as UInputElement, USelect as USelectElement } from '@iyulab/components';
import { svc } from '../lib/odata.js';
import { usePermission } from '../lib/permissions.js';
import type { Order, OrderStatus } from '../mocks/data.js';

// `@iyulab/modern-app` doesn't yet ship a `JSX.IntrinsicElements` declaration for its raw
// custom elements (unlike `@iyulab/u-widgets`, which ships one for `<u-widget>`) — without
// this block, TypeScript rejects `<u-master-detail-layout>` in JSX even though the element
// itself needs no `/react` wrapper. Remove this block once modern-app ships its own.
// `<u-option>` needs the same treatment — it's `u-select`'s own light-DOM child, registered
// as a side effect of importing `USelect` above, not something this page imports directly.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'u-master-detail-layout': {
        'master-size'?: string;
        'overlay-breakpoint'?: number;
        children?: ReactNode;
      };
      'u-option': Attributes & {
        value?: string;
        children?: ReactNode;
      };
    }
  }
}

// The edit form's Status choices deliberately exclude "cancelled" — cancelling is a separate,
// one-way destructive action (the button below), not a step in the normal fulfillment flow
// this select edits. Matches the house-style guide's own "Edit form" recipe (Data Patterns).
const EDITABLE_STATUSES: OrderStatus[] = ['pending', 'shipped', 'delivered'];

export default function OrderDetailPage({ orderId }: { orderId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const canEdit = usePermission('orders.write');

  const [editOpen, setEditOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState('');
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  async function reload() {
    const [list, current] = await Promise.all([
      svc.odataGet<Order>('Orders'),
      svc.odataGetById<Order>('Orders', orderId),
    ]);
    setOrders(list);
    setOrder(current);
  }

  useEffect(() => { reload(); }, [orderId]);

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
      // Same two-tier split as the New Order wizard (see NewOrderPage.tsx): a typed API
      // error carries a server-written message worth showing as-is; anything else (a raw
      // network failure) gets one generic, honest sentence instead of a technical one.
      if (e instanceof svc.ApiError) {
        setSaveError(e.message);
      } else {
        setSaveError('Could not reach the server. Check your connection and try again.');
      }
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
            <h2>{order.Id}</h2>
            <p>{order.Customer}</p>
            <UBadge color={order.Status === 'cancelled' ? 'danger' : 'neutral'}>{order.Status}</UBadge>
            <p>₩{order.Total.toLocaleString()}</p>
            {canEdit && order.Status !== 'cancelled' && (
              <div style={{ display: 'flex', gap: 'var(--u-space-md, 16px)' }}>
                <UButton color="primary" onClick={openEdit}>Edit order</UButton>
                <UButton color="danger" onClick={cancelOrder}>Cancel order</UButton>
              </div>
            )}

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
                  <UInput label="Total" description="Read-only — set at order creation" value={`₩${order.Total.toLocaleString()}`} disabled />
                </FormRow>
              </FormSection>
              {saveError && <UBadge color="danger">{saveError}</UBadge>}
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
