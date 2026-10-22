import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { app } from '@iyulab/modern-app';
import { at } from '../base.js';
import { wip } from '../nav.js';
import { CAPACITY, FLOORS, floorPct } from '../data.js';

type TodoKind = 'checkout' | 'return' | 'incomplete' | 'other';

interface Todo { kind: TodoKind; title: string; meta: string; due: string; action: string; color: 'info' | 'warning' | 'danger'; href: string }

const TODOS: Todo[] = [
  { kind: 'checkout', title: 'Approve checkout — 3 records for Accounting', meta: 'Requested by J. Park · today 09:12', due: '2 h waiting', action: 'Review', color: 'info', href: wip('Process checkouts') },
  { kind: 'return', title: 'Returns overdue — Procurement and 2 more', meta: 'Checked-out records past their return date', due: '9 days over', action: 'View list', color: 'warning', href: at('records?status=Overdue') },
  { kind: 'incomplete', title: 'Complete missing documents — signed amendments', meta: 'Records missing a required document', due: 'Due today', action: 'View list', color: 'danger', href: at('records?status=Incomplete') },
  { kind: 'other', title: 'Confirm transfer — Box B-0142', meta: 'Branch office → Records Center · 36 records', due: 'Waiting', action: 'Confirm', color: 'info', href: wip('Receive transfer') },
  { kind: 'other', title: 'Check 4 failed rows in a bulk import', meta: 'import_1022.xlsx · today 08:40', due: '4 failed', action: 'View results', color: 'danger', href: wip('Bulk import') },
  { kind: 'other', title: 'Over capacity — Level 2, R-007', meta: 'Shelf 4 · sectors 2 and 3', due: 'Check', action: 'Show location', color: 'warning', href: at('storage') },
];

const FILTERS: { value: TodoKind | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'return', label: 'Returns' },
  { value: 'incomplete', label: 'Incomplete' },
];

interface Kpi {
  label: string; value: number; description: string; series: number[];
  tone?: 'positive' | 'negative' | 'warning'; trend?: 'up' | 'down'; trendLabel?: string;
}

/** Sample figures with the last six days' trend. */
const KPIS: Kpi[] = [
  { label: 'Received today', value: 48, description: '96% of the planned intake', series: [30, 34, 31, 40, 42, 48], tone: 'positive', trend: 'up', trendLabel: '+6 on yesterday' },
  { label: 'Checkouts to approve', value: 7, description: 'Oldest request 2 hours ago', series: [5, 9, 6, 8, 4, 7] },
  { label: 'Overdue returns', value: 5, description: 'Up to 9 days · Procurement', series: [2, 3, 3, 4, 6, 5], tone: 'warning' },
  { label: 'Incomplete records', value: 12, description: 'Need a missing document', series: [7, 8, 8, 10, 9, 12], tone: 'negative', trend: 'up', trendLabel: '+3 this week' },
];

/** A series as polyline points in a 96×32 box — the lowest value at the bottom, the highest at the top. */
function spark(series: number[]): string {
  const min = Math.min(...series);
  const span = Math.max(...series) - min || 1;
  return series.map((v, i) => `${(i * 95) / (series.length - 1)},${(29 - ((v - min) / span) * 26).toFixed(1)}`).join(' ');
}

/** Today — what needs doing is on the first screen. */
@customElement('rc-home')
export class RcHome extends LitElement {
  protected override createRenderRoot() { return this; }

  @state() private filter: TodoKind | 'all' = 'all';

  override render() {
    const todos = this.filter === 'all' ? TODOS : TODOS.filter((t) => t.kind === this.filter);
    const countOf = (v: TodoKind | 'all') => (v === 'all' ? TODOS.length : TODOS.filter((t) => t.kind === v).length);
    return html`
      <div class="hs-page rc-page">
        <u-page-header title="Today" subtitle="Thursday, October 22, 2026 · Records Center">
          <u-input slot="actions" type="search" aria-label="Find a record" placeholder="Record ID or title — Enter"
            @search=${(e: CustomEvent<{ query: string }>) => e.detail.query && app.navigate(at(`records?q=${encodeURIComponent(e.detail.query)}`))}>
            <u-icon slot="prefix" lib="lucide" name="search"></u-icon>
          </u-input>
          <u-button slot="actions" color="primary" @click=${() => app.navigate(wip('New or edit record'))}>
            <u-icon slot="prefix" lib="lucide" name="plus"></u-icon>New record
          </u-button>
        </u-page-header>

        <u-info-section layout="strip" aria-label="Today's figures">
          ${KPIS.map((k) => html`
            <u-info-field appearance="tile" size="xl" label=${k.label} value=${k.value} numeric
              tone=${k.tone ?? nothing} trend=${k.trend ?? nothing} .trendLabel=${k.trendLabel} description=${k.description}>
              <svg slot="visual" class="rc-spark" aria-hidden="true" width="96" height="32" viewBox="0 0 96 32">
                <polyline points=${spark(k.series)} fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></polyline>
              </svg>
            </u-info-field>`)}
        </u-info-section>

        <div class="rc-split">
          <u-card>
            <div slot="header" class="rc-card-head">
              <h2>To do <span class="hs-num hs-muted">${TODOS.length}</span></h2>
              <u-radio type="button" appearance="soft" orientation="horizontal" aria-label="To-do kind" .value=${this.filter}
                @change=${(e: Event) => (this.filter = (e.target as HTMLElement & { value: TodoKind | 'all' }).value)}>
                ${FILTERS.map((f) => html`<u-option value=${f.value}>${f.label} ${countOf(f.value)}</u-option>`)}
              </u-radio>
            </div>
            <ul class="rc-todo-list">
              ${todos.map((t) => html`
                <li>
                  <u-tag color=${t.color} appearance="soft" dot>${t.due}</u-tag>
                  <div class="rc-todo-text"><strong>${t.title}</strong><span class="hs-muted">${t.meta}</span></div>
                  <u-button appearance="outlined" size="sm" @click=${() => app.navigate(t.href)}>${t.action}</u-button>
                </li>`)}
            </ul>
          </u-card>

          <u-card>
            <h2 slot="header">Recent activity</h2>
            <u-timeline>
              <u-timeline-item color="success" heading="12 records shelved — Level 2, R-003" datetime="2026-10-22T10:24">D. Lee</u-timeline-item>
              <u-timeline-item color="primary" heading="Checkout requested — RC-024812 and 3 more" datetime="2026-10-22T09:12">J. Park</u-timeline-item>
              <u-timeline-item heading="Retention date updated — RC-022281" datetime="2026-10-22T08:55">System sync</u-timeline-item>
              <u-timeline-item color="danger" heading="Bulk import — 212 added · 4 failed" datetime="2026-10-22T08:40">Dana Kim</u-timeline-item>
              <u-timeline-item heading="Closed box moved — off-site store" datetime="2026-10-21T17:30">D. Lee</u-timeline-item>
            </u-timeline>
          </u-card>
        </div>

        <div class="hs-grid-cards">
          <u-card>
            <div slot="header" class="rc-card-head"><h2>Storage usage</h2><a href=${at('storage')}>Storage map →</a></div>
            <div class="rc-usage">
              ${FLOORS.map((f) => {
                const cells = f.racks.flatMap((r) => r.cells);
                const empty = cells.filter((c) => c.count === 0).length;
                const over = cells.filter((c) => c.count > CAPACITY).length;
                const pct = floorPct(f);
                return html`
                  <div class="rc-usage-row">
                    <div class="rc-usage-label"><strong>${f.label}</strong><span class="hs-num">${pct}%</span></div>
                    <u-progress-bar value=${pct} status=${pct >= 90 || over ? 'warning' : 'default'} aria-label="${f.label} usage"></u-progress-bar>
                    <span class="hs-muted">${empty} empty sectors${over ? ` · ${over} over capacity` : ''}</span>
                  </div>`;
              })}
            </div>
          </u-card>
          <u-card>
            <div slot="header" class="rc-card-head"><h2>Notices</h2><a href=${wip('Notices')}>All →</a></div>
            <ul class="rc-notices">
              <li><a href=${wip('Notices')}><u-tag color="danger" size="sm">Important</u-tag> Retention schedule changes from November</a><span class="hs-muted">2026-10-20</span></li>
              <li><a href=${wip('Notices')}>Scheduled maintenance this weekend</a><span class="hs-muted">2026-10-14</span></li>
              <li><a href=${wip('Notices')}>New barcode label stock</a><span class="hs-muted">2026-10-02</span></li>
            </ul>
          </u-card>
          <u-card>
            <h2 slot="header">Quick actions</h2>
            <div class="rc-quick">
              <u-button appearance="outlined" @click=${() => app.navigate(wip('New or edit record'))}><u-icon slot="prefix" lib="lucide" name="file-plus"></u-icon>New record</u-button>
              <u-button appearance="outlined" @click=${() => app.navigate(wip('Bulk import'))}><u-icon slot="prefix" lib="lucide" name="upload"></u-icon>Bulk import</u-button>
              <u-button appearance="outlined" @click=${() => app.navigate(at('records'))}><u-icon slot="prefix" lib="lucide" name="barcode"></u-icon>Print barcodes</u-button>
              <u-button appearance="outlined" @click=${() => app.navigate(at('checkout/new'))}><u-icon slot="prefix" lib="lucide" name="arrow-left-right"></u-icon>Request checkout</u-button>
            </div>
          </u-card>
        </div>
      </div>
    `;
  }
}
