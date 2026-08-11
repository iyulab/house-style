import { useEffect, useState, type ReactNode } from 'react';
import '@iyulab/modern-app/dist/components/MasterDetailLayout.js';
import { UButton, UBadge } from '../lib/ui-react.js';
import { svc } from '../lib/odata.js';
import { usePermission } from '../lib/permissions.js';
import { ORDERS, type Order } from '../mocks/data.js';

// `@iyulab/modern-app` doesn't yet ship a `JSX.IntrinsicElements` declaration for its raw
// custom elements (unlike `@iyulab/u-widgets`, which ships one for `<u-widget>`) — without
// this block, TypeScript rejects `<u-master-detail-layout>` in JSX even though the element
// itself needs no `/react` wrapper. Remove this block once modern-app ships its own.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'u-master-detail-layout': {
        'master-size'?: string;
        'overlay-breakpoint'?: number;
        children?: ReactNode;
      };
    }
  }
}

export default function OrderDetailPage({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const canCancel = usePermission('orders.write');

  useEffect(() => {
    svc.odataGetById<Order>('Orders', orderId).then(setOrder);
  }, [orderId]);

  async function cancel() {
    if (!order) return;
    await svc.odataPatch<Order>('Orders', order.Id, { Status: 'cancelled' });
    setOrder({ ...order, Status: 'cancelled' });
  }

  return (
    <u-master-detail-layout master-size="20rem">
      {/* Default (unnamed) slot = the master pane; the detail pane is the named "detail"
          slot below — confirmed against MasterDetailLayout's own template, which is the
          reverse of what the prop names might suggest at a glance. */}
      <div style={{ padding: 'var(--u-space-md, 16px)' }}>
        {ORDERS.map((o) => (
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
            {canCancel && order.Status !== 'cancelled' && (
              <UButton color="danger" onClick={cancel}>Cancel order</UButton>
            )}
          </>
        ) : (
          <p>Loading…</p>
        )}
      </div>
    </u-master-detail-layout>
  );
}
