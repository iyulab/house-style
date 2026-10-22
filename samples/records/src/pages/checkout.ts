import { LitElement, html, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { app } from '@iyulab/modern-app';
import type { ColumnDef, URichTable } from '@iyulab/data-components';
import { at } from '../base.js';
import { wip } from '../nav.js';
import { RECORDS, STATUS_COLOR, type RecordFile } from '../data.js';

/** A record already out, or closed, can't be requested — the table turns off that row's checkbox. */
const canRequest = (r: Record<string, unknown>) => r.status !== 'Checked out' && r.status !== 'Overdue' && r.status !== 'Closed';

const COLUMNS: ColumnDef[] = [
  { key: 'id', label: 'Record ID', width: '120px' },
  { key: 'title', label: 'Title', width: '240px' },
  { key: 'department', label: 'Department', width: '120px' },
  { key: 'location', label: 'Location', width: '130px', render: (v) => (v ? String(v) : '—') },
  { key: 'status', label: 'Status', width: '120px', render: (v) => html`<u-tag color=${STATUS_COLOR[v as RecordFile['status']]} appearance="soft" size="sm">${String(v)}</u-tag>` },
];

/**
 * Request checkout — pick records from the search results (the table's selection), fill in the request beside it,
 * submit once. Selecting is the basket: the table knows rows by record ID (`row-key`), so a picked record stays while
 * the search changes, and `selectable` keeps out the ones that can't be requested.
 */
@customElement('rc-checkout')
export class RcCheckout extends LitElement {
  protected override createRenderRoot() { return this; }

  /** Records picked on the list before coming here (`?ids=`). */
  @property({ attribute: false }) preset: string[] = [];

  @state() private query = 'Harbor';
  /** The picked records — the table's `selection-change` is the source of truth. */
  @state() private picked: string[] = [];
  @query('u-rich-table') private table?: URichTable;

  private pendingPreset: string[] | null = null;

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('preset') && this.preset.length) {
      // Take only the passed records that can be requested.
      const ok = this.preset.filter((id) => { const r = RECORDS.find((x) => x.id === id); return !!r && canRequest(r); });
      this.pendingPreset = ok;
      this.query = '';
      const skipped = this.preset.length - ok.length;
      if (skipped) app.warning(`${skipped} of them are already out or closed and were left out.`);
    }
  }

  protected override updated() {
    // Hand the passed selection to the table once it is drawn — the table owns the selection. After this update
    // completes: the table's `selection-change` updates this screen again, and calling it mid-update would schedule an
    // update inside an update.
    if (this.pendingPreset && this.table) {
      const ids = this.pendingPreset;
      this.pendingPreset = null;
      void this.updateComplete.then(() => this.table?.setSelection(ids));
    }
  }

  private get results(): RecordFile[] {
    const q = this.query.trim().toLowerCase();
    return RECORDS.filter((r) => r.status !== 'Closed' && (!q || [r.id, r.title, r.department].some((f) => f.toLowerCase().includes(q))));
  }

  private unpick(id: string) {
    this.table?.setSelection(this.picked.filter((x) => x !== id));
  }

  private submit() {
    const form = this.querySelector('u-form') as (HTMLElement & { reportValidity?: () => boolean }) | null;
    if (form?.reportValidity && !form.reportValidity()) return;
    app.success(`Checkout requested for ${this.picked.length} records — waiting for the custodian's approval.`);
    this.table?.clearSelection();
    // Drop the passed records (`?ids=`) from the address, so a reload doesn't put the submitted ones back.
    history.replaceState(history.state, '', at('checkout/new'));
  }

  override render() {
    const picked = RECORDS.filter((r) => this.picked.includes(r.id));
    return html`
      <div class="hs-page rc-page">
        <u-page-header title="Request checkout" subtitle="Put the records you need into the request and say what for. A custodian approves it before they go out.">
          <u-breadcrumb slot="eyebrow">
            <u-breadcrumb-item>Checkout and transfer</u-breadcrumb-item>
            <u-breadcrumb-item>Request checkout</u-breadcrumb-item>
          </u-breadcrumb>
          <u-button slot="actions" appearance="link" @click=${() => app.navigate(wip('My requests'))}>My requests (3 open)</u-button>
        </u-page-header>

        <div class="hs-detail__cols">
          <u-card>
            <h2 slot="header"><span class="rc-step">1</span>Pick records</h2>
            <u-input type="search" label="Search" .value=${this.query} placeholder="Record ID, title or department"
              @search=${(e: CustomEvent<{ query: string }>) => (this.query = e.detail.query)}>
              <u-icon slot="prefix" lib="lucide" name="search"></u-icon>
            </u-input>
            <p class="hs-muted rc-result-note"><strong class="hs-num">${this.results.length}</strong> found · picked records stay when the search changes · records already out can't be picked</p>
            <u-rich-table aria-label="Records to request" row-key="id" data-mode="client" .pageSize=${8} .pageSizes=${[]}
              .selectable=${canRequest} .columns=${COLUMNS} .data=${this.results}
              @selection-change=${(e: CustomEvent<{ selectedIds: string[] }>) => (this.picked = e.detail.selectedIds)}></u-rich-table>
          </u-card>

          <u-card>
            <div slot="header" class="rc-card-head">
              <h2><span class="rc-step">2</span>Request</h2>
              <u-tag color="primary" appearance="soft"><span class="hs-num">${picked.length}</span> picked</u-tag>
            </div>
            ${picked.length
              ? html`
                  <ul class="rc-basket">
                    ${picked.map((r) => html`
                      <li>
                        <div class="rc-basket-text">
                          <span><span class="hs-id">${r.id}</span> <strong>${r.title}</strong></span>
                          <span class="hs-muted">${r.department} · ${r.location ? html`<span class="rc-code">${r.location}</span>` : 'no location yet'}</span>
                        </div>
                        <u-icon-button lib="lucide" name="x" appearance="plain" @click=${() => this.unpick(r.id)}>Remove ${r.id}</u-icon-button>
                      </li>`)}
                  </ul>`
              : html`<u-empty-state variant="no-data" title="Nothing picked yet" description="Pick records in the table."></u-empty-state>`}

            <u-form class="rc-request-form">
              <div class="hs-grid-2">
                <u-input label="Requested by" value="Dana Kim (Records Center)" required></u-input>
                <u-date-picker label="Return by" value="2026-10-29" min="2026-10-22" required></u-date-picker>
              </div>
              <u-select label="Purpose" value="audit">
                <u-option value="audit">Audit review</u-option>
                <u-option value="legal">Legal proceedings</u-option>
                <u-option value="copy">Copy for a customer</u-option>
                <u-option value="other">Other</u-option>
              </u-select>
              <u-radio label="Delivery" type="button" appearance="soft" orientation="horizontal" value="pickup">
                <u-option value="pickup">Pick up</u-option>
                <u-option value="courier">Internal courier</u-option>
              </u-radio>
              <u-textarea label="Note" placeholder="Anything the custodian should know"></u-textarea>
            </u-form>
            <u-action-bar slot="footer">
              <u-button color="primary" ?disabled=${!picked.length} @click=${this.submit}>Request ${picked.length} records</u-button>
            </u-action-bar>
          </u-card>
        </div>
      </div>
    `;
  }
}
