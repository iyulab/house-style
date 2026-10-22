import { LitElement, html, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { createArraySource } from '@iyulab/flex-table/array';
import type { ColumnDef, URichTable } from '@iyulab/data-components';
import { app } from '@iyulab/modern-app';
import { at } from '../base.js';
import { wip } from '../nav.js';
import { CATEGORIES, DEPARTMENTS, RECORDS, STATUSES, STATUS_COLOR, type RecordFile, type RecordStatus } from '../data.js';

const COLUMNS: ColumnDef[] = [
  { key: 'id', label: 'Record ID', width: '130px', sortable: true },
  { key: 'title', label: 'Title', width: '300px', sortable: true },
  { key: 'category', label: 'Category', width: '110px' },
  { key: 'department', label: 'Department', width: '130px' },
  { key: 'pages', label: 'Pages', width: '90px', align: 'end', sortable: true, render: (v) => Number(v).toLocaleString('en-US') },
  { key: 'createdAt', label: 'Created', width: '110px', sortable: true },
  { key: 'status', label: 'Status', width: '130px', render: (v) => html`<u-tag color=${STATUS_COLOR[v as RecordStatus]} appearance="soft" dot>${String(v)}</u-tag>` },
  { key: 'location', label: 'Location', width: '140px', render: (v) => (v ? String(v) : '—') },
];

const CRITERIA = ['q', 'category', 'department', 'range'] as const;
type Criterion = (typeof CRITERIA)[number];

const matches = (r: RecordFile, q: string) => !q || [r.id, r.title].some((f) => f.toLowerCase().includes(q.toLowerCase()));

/** Find records — the reference for a search-and-list screen. Status tabs, criteria, table and pager share one source. */
@customElement('rc-records')
export class RcRecords extends LitElement {
  protected override createRenderRoot() { return this; }

  /** Status tab — empty for all. Comes from the address (`?status=`). */
  @property({ type: String }) status = '';
  /** Criteria — the address is the source of truth (`?q=` · `category=` · `department=` · `range=`). */
  @property({ type: String }) q = '';
  @property({ type: String }) category = '';
  @property({ type: String }) department = '';
  /** Created-date range `YYYY-MM-DD/YYYY-MM-DD` — empty for any date. */
  @property({ type: String }) range = '';
  @state() private selected: string[] = [];
  @query('u-rich-table') private table?: URichTable;

  private static readonly OPTIONS = {
    pageSize: 10,
    defaultOrderBy: 'createdAt desc',
    searchFields: (row: RecordFile) => [row.id, row.title],
  };
  private source = createArraySource<RecordFile>(RECORDS, RcRecords.OPTIONS);

  /** Records matching every criterion but the status — the population the tab counts are taken from. */
  private get scoped(): RecordFile[] {
    const [from, to] = this.range ? this.range.split('/') : [];
    return RECORDS.filter((r) =>
      matches(r, this.q) &&
      (!this.category || r.category === this.category) &&
      (!this.department || r.department === this.department) &&
      (!from || r.createdAt >= from) &&
      (!to || r.createdAt <= to));
  }

  private get rows(): RecordFile[] {
    const scoped = this.scoped;
    return this.status ? scoped.filter((r) => r.status === this.status) : scoped;
  }

  protected override willUpdate(changed: PropertyValues) {
    if (['status', ...CRITERIA].some((k) => changed.has(k))) {
      // `update` replaces the options as a whole — pass the same ones again so the search fields stay.
      this.source.update(this.rows, RcRecords.OPTIONS);
      this.table?.clearSelection();
      this.selected = [];
    }
  }

  private href(status?: string) {
    const p = new URLSearchParams();
    if (status) p.set('status', status);
    for (const key of CRITERIA) if (this[key]) p.set(key, this[key]);
    const s = p.toString();
    return at(s ? `records?${s}` : 'records');
  }

  /** Changes a criterion and keeps it in the address — switching tabs, a reload or a shared link opens the same list. */
  private setCriterion(key: Criterion, value: string) {
    this[key] = value;
    history.replaceState(history.state, '', this.href(this.status || undefined));
  }

  private exportCsv() {
    const rows = this.rows;
    const head = COLUMNS.map((c) => c.label);
    const body = rows.map((r) => COLUMNS.map((c) => String(r[c.key] ?? '')));
    const csv = [head, ...body].map((line) => line.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `records_${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
    app.success(`Exported ${rows.length} records.`);
  }

  private openLocation(id: string) {
    const r = RECORDS.find((x) => x.id === id);
    if (r?.location.startsWith('L2-')) app.navigate(at(`storage?find=${encodeURIComponent(r.id)}`));
    else app.info(`${id} is not on a rack — ${r?.location || 'no location yet'}.`);
  }

  private pick = (key: Criterion) => (e: Event) => this.setCriterion(key, String((e.target as HTMLElement & { value?: string }).value ?? ''));

  override render() {
    const n = this.selected.length;
    const scoped = this.scoped;
    const count = (s?: RecordStatus) => (s ? scoped.filter((r) => r.status === s).length : scoped.length);
    return html`
      <div class="hs-page rc-page">
        <u-list-page .source=${this.source} appearance="card">
          <u-page-header slot="header" title="Find records">
            <u-breadcrumb slot="eyebrow">
              <u-breadcrumb-item>Records</u-breadcrumb-item>
              <u-breadcrumb-item>Find records</u-breadcrumb-item>
            </u-breadcrumb>
            <u-button slot="actions" appearance="outlined" @click=${() => app.navigate(wip('Bulk import'))}><u-icon slot="prefix" lib="lucide" name="upload"></u-icon>Bulk import</u-button>
            <u-button slot="actions" color="primary" @click=${() => app.navigate(wip('New or edit record'))}><u-icon slot="prefix" lib="lucide" name="plus"></u-icon>New record</u-button>
          </u-page-header>

          <u-tab-nav slot="filters" class="rc-status-tabs" label="Record status" value=${this.status || 'all'}>
            <u-tab value="all" href=${this.href()} count=${count()}>All</u-tab>
            ${STATUSES.map((s) => html`<u-tab value=${s} href=${this.href(s)} count=${count(s)}>${s}</u-tab>`)}
          </u-tab-nav>

          <u-input slot="filters" type="search" label="Search" placeholder="Record ID or title"
            .value=${this.q} @search=${(e: CustomEvent<{ query: string }>) => this.setCriterion('q', e.detail.query)}>
            <u-icon slot="prefix" lib="lucide" name="search"></u-icon>
          </u-input>
          <u-date-range-picker slot="filters" label="Created" presets="today last7Days last30Days last3Months last6Months" clearable
            .value=${this.range} @change=${this.pick('range')}></u-date-range-picker>
          <u-select slot="filters" label="Category" .value=${this.category} @change=${this.pick('category')}>
            <u-option value="">All</u-option>
            ${CATEGORIES.map((c) => html`<u-option value=${c}>${c}</u-option>`)}
          </u-select>
          <u-select slot="filters" label="Department" .value=${this.department} @change=${this.pick('department')}>
            <u-option value="">All</u-option>
            ${DEPARTMENTS.map((d) => html`<u-option value=${d}>${d}</u-option>`)}
          </u-select>

          <u-action-bar slot="toolbar">
            ${n
              ? html`
                  <span slot="summary"><strong class="hs-num">${n}</strong> selected</span>
                  <u-button color="primary" @click=${() => app.navigate(at(`checkout/new?ids=${this.selected.join(',')}`))}>Request checkout</u-button>
                  <u-button appearance="outlined" @click=${() => app.success(`Sent ${n} barcodes to the print queue (sample — no printer).`)}>Print barcodes</u-button>
                  <u-button appearance="outlined" @click=${() => app.navigate(wip('Bulk relocation'))}>Relocate</u-button>
                  <u-button appearance="plain" @click=${() => this.table?.clearSelection()}>Clear selection</u-button>`
              : html`
                  <u-button appearance="outlined" @click=${this.exportCsv}><u-icon slot="prefix" lib="lucide" name="download"></u-icon>Export CSV</u-button>`}
          </u-action-bar>

          <u-rich-table slot="view" aria-label="Records" row-key="id" selectable hide-pagination hide-toolbar
            .columns=${COLUMNS}
            @row-activate=${(e: CustomEvent<{ id: string }>) => this.openLocation(e.detail.id)}
            @selection-change=${(e: CustomEvent<{ selectedIds: string[] }>) => (this.selected = e.detail.selectedIds)}></u-rich-table>
          <u-pagination slot="pager" label="Records pages"></u-pagination>
          <u-empty-state slot="empty" variant="no-results" title="No records match"
            description=${this.status ? 'Pick another status tab or clear the criteria.' : 'Try another search or period.'}></u-empty-state>
        </u-list-page>
      </div>
    `;
  }
}
