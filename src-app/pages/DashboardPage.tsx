import '@iyulab/u-widgets';
import '@iyulab/u-widgets/charts';
// The widgets ship their own neutral token defaults so they work standalone. This app also
// loads @iyulab/components, and without this sheet the two disagree on five axes at once
// (primary color, body text, secondary text, font family, corner radius). The sheet binds one
// token set to the other by reference — including the chart palette, slot for slot — so the chart
// below draws its series in the house chart colours (`--u-chart-color-*`) — slot one is the house
// interaction blue, the colour of links, focus and selection around it.
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
import { navigate } from '@iyulab/router';
import { won } from '../lib/money.js';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'u-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

const APP = `${import.meta.env.BASE_URL}app`;

/** A link the router follows — a real anchor (middle-click, copy address) that navigates in place on a plain click. */
function RouteLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a className={className} href={href} onClick={(e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      navigate(href);
    }}>{children}</a>
  );
}

export default function DashboardPage() {
  const pendingOrders = ORDERS.filter((o) => o.Status === 'pending')
    .sort((a, b) => a.CreatedAt.localeCompare(b.CreatedAt));
  const pending = pendingOrders.length;
  const revenue = ORDERS.reduce((sum, o) => sum + o.Total, 0);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Today at a glance" />
      <div style={{ display: 'grid', gap: 'var(--u-space-lg, 18px)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      {/* The stat strip is `u-info-field size="lg"` in a `u-info-section layout="strip"` — the
          pattern the guide teaches: cells on one surface split by hairlines, all side by side or
          all stacked below 640px. The trend figures are
          illustrative constants, not derived from `ORDERS`; a real dashboard would compute
          them against a prior period.
          ★The third tile is why this pattern is the one to follow here: a falling pending-order
          count is a downward *trend* but good *news*, and `tone` is a separate prop precisely so
          the two can disagree. A metric widget infers colour from direction alone, so the same
          tile reads as a warning there. */}
      <div style={{ gridColumn: '1 / -1' }}>
        <InfoSection layout="strip">
          <InfoField label="Orders today" size="lg" value={ORDERS.length} trend="up" trendLabel="+8.2% vs yesterday" />
          <InfoField label="Revenue today" size="lg" format="currency" currency="KRW" value={revenue} trend="up" trendLabel="+12.5% vs yesterday" />
          <InfoField label="Pending orders" size="lg" value={pending} trend="down" trendLabel="−4 vs yesterday" tone="positive" />
          <InfoField label="Avg. fulfillment" size="lg" value={2.4} unit="days" trend="flat" trendLabel="No change" />
        </InfoSection>
      </div>
      {/* The work waiting on someone, oldest first — a dashboard says what to do next, and each row is one step from
          doing it. «All pending» opens the list already filtered (the list keeps its criteria in the address). */}
      <u-card style={{ gridColumn: '1 / -1' }}>
        <div slot="header" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--u-space-md, 12px)' }}>
          <strong>Needs attention</strong>
          <RouteLink href={`${APP}/orders?status=pending`}>All pending orders ({pending})</RouteLink>
        </div>
        {pending === 0
          ? <p className="hs-muted" style={{ margin: 0 }}>Nothing is waiting — every order has moved past pending.</p>
          : (
            <table className="hs-table hs-table--compact">
              <thead>
                <tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col" className="hs-num">Total</th></tr>
              </thead>
              <tbody>
                {pendingOrders.slice(0, 5).map((o) => (
                  <tr key={o.Id}>
                    <td><RouteLink className="hs-id" href={`${APP}/orders/${o.Id}`}>{o.Id}</RouteLink></td>
                    <td>{o.Customer}</td>
                    <td className="hs-nowrap">{o.CreatedAt.slice(0, 10)}</td>
                    <td className="hs-num">{won(o.Total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </u-card>
      {/* Illustrative constant series, not derived from `ORDERS`. */}
      <u-card style={{ gridColumn: '1 / -1' }}>
        <UWidget
          spec={{
            widget: 'chart.bar',
            // One series, so the title names it — no legend box (a legend with one entry says nothing).
            title: 'Orders this week',
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
