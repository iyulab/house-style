import '@iyulab/u-widgets';
import '@iyulab/u-widgets/charts';
import { UWidget } from '@iyulab/u-widgets/react';
import { ORDERS } from '../mocks/data.js';
// `u-card` gives each widget below its border/shadow/padding — `@iyulab/u-widgets`' widgets
// intentionally render bare (no card chrome of their own), so it's the consuming app's job to
// frame them. `@iyulab/components/react` can't be imported in this program (see ui-react.ts),
// so this is a raw custom element, registered via the same deep-import + JSX augmentation
// pattern OrderDetailPage.tsx already uses for `u-master-detail-layout`.
import '@iyulab/components/dist/components/card/UCard.js';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'u-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export default function DashboardPage() {
  const pending = ORDERS.filter((o) => o.Status === 'pending').length;
  const revenue = ORDERS.reduce((sum, o) => sum + o.Total, 0);

  return (
    <div style={{ display: 'grid', gap: 'var(--u-space-lg, 18px)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      {/* `change` below is an illustrative constant, not derived from `ORDERS` — a real
          dashboard would compute it against a prior period. */}
      <u-card>
        <UWidget spec={{ widget: 'metric', data: { value: ORDERS.length, label: 'Orders today', change: 8.2, trend: 'up' } }} />
      </u-card>
      <u-card>
        <UWidget spec={{ widget: 'metric', data: { value: revenue, label: 'Revenue today', unit: 'KRW', change: 12.5, trend: 'up' } }} />
      </u-card>
      <u-card>
        <UWidget spec={{ widget: 'metric', data: { value: pending, label: 'Pending orders', change: -4, trend: 'down' } }} />
      </u-card>
      {/* Illustrative constant series, not derived from `ORDERS`. */}
      <u-card style={{ gridColumn: '1 / -1' }}>
        <UWidget
          spec={{
            widget: 'chart.bar',
            data: [
              { name: 'Mon', value: 3 }, { name: 'Tue', value: 5 }, { name: 'Wed', value: 2 },
              { name: 'Thu', value: 6 }, { name: 'Fri', value: 4 },
            ],
          }}
        />
      </u-card>
    </div>
  );
}
