import '@iyulab/u-widgets';
import '@iyulab/u-widgets/charts';
import { UWidget } from '@iyulab/u-widgets/react';
import { ORDERS } from '../mocks/data.js';

export default function DashboardPage() {
  const pending = ORDERS.filter((o) => o.Status === 'pending').length;
  const revenue = ORDERS.reduce((sum, o) => sum + o.Total, 0);

  return (
    <div style={{ display: 'grid', gap: 'var(--u-space-lg, 18px)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      <UWidget spec={{ widget: 'metric', data: { value: ORDERS.length, unit: 'orders', change: 8.2, trend: 'up' } }} />
      <UWidget spec={{ widget: 'metric', data: { value: revenue, unit: 'KRW', change: 12.5, trend: 'up' } }} />
      <UWidget spec={{ widget: 'metric', data: { value: pending, unit: 'pending', change: -4, trend: 'down' } }} />
      <UWidget
        spec={{
          widget: 'chart.bar',
          data: [
            { name: 'Mon', value: 3 }, { name: 'Tue', value: 5 }, { name: 'Wed', value: 2 },
            { name: 'Thu', value: 6 }, { name: 'Fri', value: 4 },
          ],
        }}
        style={{ gridColumn: '1 / -1' }}
      />
    </div>
  );
}
