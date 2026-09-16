import '@iyulab/u-widgets';
import '@iyulab/u-widgets/charts';
// The widgets ship their own neutral token defaults so they work standalone. This app also
// loads @iyulab/components, and without this sheet the two disagree on five axes at once
// (primary color, body text, secondary text, font family, corner radius). The sheet binds one
// token set to the other by reference, so the chart below follows the same palette as
// everything around it.
import '@iyulab/u-widgets/themes/components.css';
import { UWidget } from '@iyulab/u-widgets/react';
import { InfoField } from '@iyulab/modern-app/react/InfoField.js';
import { InfoSection } from '@iyulab/modern-app/react/InfoSection.js';
import { ORDERS } from '../mocks/data.js';
// `u-card` gives each widget below its border/shadow/padding — `@iyulab/u-widgets`' widgets
// intentionally render bare (no card chrome of their own), so it's the consuming app's job to
// frame them. `@iyulab/components/react` does ship a `UCard` wrapper, but this page uses the
// card purely as a frame — no props, no events — so the raw custom element registered via the
// deep-import + JSX augmentation pattern OrderDetailPage.tsx already uses is enough here.
import '@iyulab/components/dist/components/card/UCard.js';
import { PageHeader } from '@iyulab/modern-app/react/PageHeader.js';

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
    <>
      <PageHeader title="Dashboard" subtitle="Today at a glance" />
      <div style={{ display: 'grid', gap: 'var(--u-space-lg, 18px)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      {/* The tile strip is `u-info-field size="lg"` in a `u-info-section` grid — the pattern
          the guide teaches, not a dedicated stat-tile component. The trend figures are
          illustrative constants, not derived from `ORDERS`; a real dashboard would compute
          them against a prior period.
          ★The third tile is why this pattern is the one to follow here: a falling pending-order
          count is a downward *trend* but good *news*, and `tone` is a separate prop precisely so
          the two can disagree. A metric widget infers colour from direction alone, so the same
          tile reads as a warning there. */}
      <div style={{ gridColumn: '1 / -1' }}>
        <InfoSection min={180}>
          <InfoField label="Orders today" size="lg" value={ORDERS.length} trend="up" trendLabel="+8.2% vs yesterday" />
          <InfoField label="Revenue today" size="lg" format="currency" currency="KRW" value={revenue} trend="up" trendLabel="+12.5% vs yesterday" />
          <InfoField label="Pending orders" size="lg" value={pending} trend="down" trendLabel="−4 vs yesterday" tone="positive" />
          <InfoField label="Avg. fulfillment" size="lg" value="2.4 days" trend="flat" trendLabel="No change" />
        </InfoSection>
      </div>
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
    </>
  );
}
