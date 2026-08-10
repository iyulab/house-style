import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/components/dist/components/date-picker/UDatePicker.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/components/dist/components/badge/UBadge.js';
import '@iyulab/components/dist/components/drawer/UDrawer.js';
import '@iyulab/components/dist/components/input/UInput.js';
import '@iyulab/components/dist/components/select/USelect.js';
import '@iyulab/components/dist/components/option/UOption.js';
import '@iyulab/components/dist/components/field/UField.js';
import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import '@iyulab/modern-app/dist/components/InfoField.js';
import '@iyulab/modern-app/dist/components/EmptyState.js';
import '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import type { ColumnDef, FilterState, RichTableEventMap } from '@iyulab/data-components/dist/components/u-rich-table/types.js';
import type { UDrawer } from '@iyulab/components/dist/components/drawer/UDrawer.js';
import type { UInput } from '@iyulab/components/dist/components/input/UInput.js';

const COLUMNS: ColumnDef[] = [
  { key: 'id', label: 'Order', width: '120px' },
  { key: 'customer', label: 'Customer', filterable: true, filterType: 'text' },
  {
    key: 'status', label: 'Status', width: '140px',
    filterable: true, filterType: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'shipped', label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
    ],
    render: renderStatusBadge,
  },
  { key: 'total', label: 'Total', align: 'right', width: '120px' },
];

const STATUS_BADGE_COLOR: Record<string, 'neutral' | 'info' | 'success'> = {
  pending: 'neutral',
  shipped: 'info',
  delivered: 'success',
};

function renderStatusBadge(value: unknown): HTMLElement {
  const status = String(value);
  const badge = document.createElement('u-badge');
  badge.setAttribute('color', STATUS_BADGE_COLOR[status] ?? 'neutral');
  badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  return badge;
}

const ROWS = [
  { _id: '1', id: 'G-2026-0512', customer: 'Aster Trading', status: 'pending', total: '₩1,240,000' },
  { _id: '2', id: 'G-2026-0513', customer: 'Blue Harbor Co.', status: 'shipped', total: '₩380,500' },
  { _id: '3', id: 'G-2026-0514', customer: 'Cedar & Finch', status: 'delivered', total: '₩92,000' },
  { _id: '4', id: 'G-2026-0515', customer: 'Aster Trading', status: 'pending', total: '₩2,010,000' },
];

const FILTER_ITEMS = ['Aster Trading', 'Blue Harbor Co.', 'Cedar & Finch'];

const LINE_ITEM_COLUMNS: ColumnDef[] = [
  { key: 'item', label: 'Item', filterable: false },
  { key: 'qty', label: 'Qty', align: 'right', width: '80px' },
  { key: 'unitPrice', label: 'Unit price', align: 'right', width: '120px' },
  { key: 'subtotal', label: 'Subtotal', align: 'right', width: '120px' },
];

const LINE_ITEMS = [
  { _id: 'li-1', item: 'Business cards, 500ct', qty: 2, unitPrice: '₩45,000', subtotal: '₩90,000' },
  { _id: 'li-2', item: 'Letterhead, A4', qty: 1, unitPrice: '₩1,150,000', subtotal: '₩1,150,000' },
  { _id: 'li-3', item: 'Envelope, #10', qty: 1, unitPrice: '₩0', subtotal: '₩0' },
];

/**
 * §4 Data visualization & patterns.
 *
 * Graded the blueprint's biggest gap. The gap is uneven within the category itself:
 * data representation, the list screen (with its status-badge convention and empty-state
 * pairing), the related-records (1:N) recipe, and the edit-form assembly are all real,
 * running compositions of already-shipped components — none of them required a new
 * house-style-specific component. The status-history timeline is the one remaining
 * piece, and it stays undecided on purpose — see the section below.
 */
@customElement('house-data-patterns-section')
export class DataPatternsSection extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @state() private selectedCount = 0;
  @state() private filterText = '';

  /**
   * `u-rich-table` renders the filter row and emits `filter-change`, but does not filter
   * its own `.data` — that's the host's job (the same contract server-paged consumers rely
   * on to turn a filter into an API query instead of a client-side operation). This demo's
   * data is static, so filtering happens here.
   */
  @state() private filters: FilterState = {};

  private handleSelectionChange(e: RichTableEventMap['selection-change']) {
    this.selectedCount = e.detail.selectedIds.length;
  }

  private handleFilterChange(e: RichTableEventMap['filter-change']) {
    this.filters = e.detail.filters;
  }

  private get filteredRows() {
    return ROWS.filter(row =>
      Object.entries(this.filters).every(([field, value]) => {
        const cell = String((row as Record<string, unknown>)[field] ?? '');
        const column = COLUMNS.find(c => c.key === field);
        return column?.filterType === 'select'
          ? cell === value
          : cell.toLowerCase().includes(value.toLowerCase());
      }));
  }

  private openEditDrawer() {
    this.querySelector<UDrawer>('#edit-drawer')?.show();
  }

  private closeEditDrawer() {
    this.querySelector<UDrawer>('#edit-drawer')?.hide();
  }

  render() {
    return html`
      <u-page-header
        title="Data patterns"
        subtitle="Data representation, list screens, status, filters, related records, and edit forms — assembled from shipped components"
      ></u-page-header>

      <u-group-box title="Data representation — built">
          <p>
            One consistent API for the three representations that used to disagree with
            each other screen to screen: a raw number, a formatted amount, and a date.
          </p>
          <u-info-section min="200">
            <u-info-field label="Amount (currency)" format="currency" currency="KRW" .value=${550000}></u-info-field>
            <u-info-field label="Quantity (number)" format="number" .value=${1234567}></u-info-field>
            <u-info-field label="Ordered at (date)" format="date" .value=${'2026-02-24'}></u-info-field>
            <u-info-field label="Zero is a value, not blank" format="currency" currency="KRW" .value=${0}></u-info-field>
          </u-info-section>
          <u-date-picker label="Delivery date" value="2026-03-31" clearable></u-date-picker>
        </u-group-box>

        <u-group-box title="List screen — assembled, not a dedicated kit">
          <p>
            No purpose-built "list-screen kit" component exists — this is
            <code>u-rich-table</code> from <code>@iyulab/data-components</code>, as-is,
            with its own filter row, selection tracking and bulk-action slot switched on.
            Nothing here is a house-style-specific component; the assembly itself is the
            answer to "how do these already-built pieces fit together." The Status column
            renders through <code>ColumnDef.render</code> as <code>u-badge</code> — see the
            convention below for which color means what.
          </p>
          <u-rich-table
            .columns=${COLUMNS}
            .data=${this.filteredRows}
            .totalCount=${this.filteredRows.length}
            selectable
            filterable
            .filterPlaceholder=${'Filter…'}
            .filterAllLabel=${'All statuses'}
            @selection-change=${this.handleSelectionChange}
            @filter-change=${this.handleFilterChange}
          >
            <span slot="bulk-actions">
              ${this.selectedCount > 0
                ? html`<u-badge color="primary">${this.selectedCount} selected</u-badge>
                       <u-button size="sm" variant="outlined">Export</u-button>
                       <u-button size="sm" color="danger" variant="outlined">Cancel orders</u-button>`
                : ''}
            </span>
          </u-rich-table>
        </u-group-box>

        <u-group-box title="Status → badge convention">
          <p>
            Color is reserved for state a user needs to notice at a glance — the table
            above renders <code>status</code> through a <code>ColumnDef.render</code> hook
            that maps each value to a role token, never a raw hue.
          </p>
          <u-info-section min="200">
            <u-info-field label="pending">
              <u-badge color="neutral">Pending</u-badge>
              <div>Waiting — no action needed yet, so it stays neutral rather than a warning color.</div>
            </u-info-field>
            <u-info-field label="shipped">
              <u-badge color="info">Shipped</u-badge>
              <div>In transit — informational, not a call to action.</div>
            </u-info-field>
            <u-info-field label="delivered">
              <u-badge color="success">Delivered</u-badge>
              <div>Done — the one state worth a positive color, not just "no longer pending."</div>
            </u-info-field>
          </u-info-section>
        </u-group-box>

        <u-group-box title="Filter with no matches">
          <p>
            A live filter over a small independent list — not the table above, so this
            recipe stays legible on its own. Type something that matches nothing (e.g.
            "zzz") to see the <code>no-results</code> empty state; use the "Clear filter"
            button in that state to get back to the list.
          </p>
          <u-input
            placeholder="Filter customers…"
            .value=${this.filterText}
            @input=${(e: Event) => { this.filterText = (e.target as UInput).value ?? ''; }}
          ></u-input>
          ${(() => {
            const matches = FILTER_ITEMS.filter(name =>
              name.toLowerCase().includes(this.filterText.toLowerCase()));
            return matches.length > 0
              ? html`<ul>${matches.map(name => html`<li>${name}</li>`)}</ul>`
              : html`
                <u-empty-state variant="no-results">
                  <span slot="actions">
                    <u-button size="sm" variant="outlined" @click=${() => { this.filterText = ''; }}>
                      Clear filter
                    </u-button>
                  </span>
                </u-empty-state>
              `;
          })()}
        </u-group-box>

        <u-group-box title="No data yet">
          <p>
            A different empty state for a different reason — nothing has been created,
            rather than a filter matching nothing. The action is "create," not "change the
            filter."
          </p>
          <u-empty-state variant="no-data">
            <span slot="actions">
              <u-button size="sm" color="primary">New order</u-button>
            </span>
          </u-empty-state>
        </u-group-box>

        <u-group-box title="Line items — order G-2026-0512">
          <span slot="actions">
            <u-button size="sm" variant="outlined">Add item</u-button>
          </span>
          <p>
            The one-to-many case: a single order, many line items. No dedicated
            "related-list" component exists — this is the same <code>u-group-box</code> +
            <code>u-rich-table</code> pairing as the List screen above, just nested inside
            one record's detail view instead of standing alone, with columns trimmed to
            what belongs on a line item and the "add related record" action riding in the
            group-box's own <code>actions</code> slot.
          </p>
          <u-rich-table
            .columns=${LINE_ITEM_COLUMNS}
            .data=${LINE_ITEMS}
            .totalCount=${3}
          ></u-rich-table>
        </u-group-box>

        <u-group-box title="Edit form — assembled, not a dedicated kit">
          <p>
            Same story as the list screen: no purpose-built "edit-form kit" component
            exists. This is <code>u-drawer</code> — its existing header/body/footer
            slots and imperative <code>show()</code>/<code>hide()</code> — wrapped
            around the same <code>u-info-section</code> + <code>u-field</code> grid
            composition a full-page edit screen already uses elsewhere in this
            framework, so a field keeps the same column rhythm whether it sits on a
            page or inside a drawer.
          </p>
          <u-button color="primary" @click=${this.openEditDrawer}>Edit order</u-button>
          <u-drawer id="edit-drawer" placement="right" closable>
            <span slot="header">Edit order G-2026-0512</span>
            <u-info-section min="200">
              <u-field label="Customer" required>
                <u-input value="Aster Trading"></u-input>
              </u-field>
              <u-field label="Status">
                <u-select value="pending">
                  <u-option value="pending">Pending</u-option>
                  <u-option value="shipped">Shipped</u-option>
                  <u-option value="delivered">Delivered</u-option>
                </u-select>
              </u-field>
              <u-field label="Delivery date">
                <u-date-picker value="2026-03-31" clearable></u-date-picker>
              </u-field>
              <u-field label="Total" description="Read-only — set at order creation">
                <u-input value="₩1,240,000" disabled></u-input>
              </u-field>
            </u-info-section>
            <div slot="footer">
              <u-button variant="ghost" @click=${this.closeEditDrawer}>Cancel</u-button>
              <u-button color="primary" @click=${this.closeEditDrawer}>Save</u-button>
            </div>
          </u-drawer>
        </u-group-box>

        <u-group-box title="Not yet built — by design">
          <p>
            A status-history timeline is not a missing implementation — it's a
            deliberate hold. <code>@iyulab/modern-app</code>'s own charter already
            names this exact pattern ("timeline / step rail") and records the
            repeated need it has observed, but concludes the shape hasn't converged
            on one answer yet. Building a house-style-specific version here would
            pre-empt that judgment rather than honor it, so this stays undecided
            until the upstream charter is ready to.
          </p>
        </u-group-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-data-patterns-section': DataPatternsSection;
  }
}
