import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/components/dist/components/date-picker/UDatePicker.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/components/dist/components/badge/UBadge.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import '@iyulab/modern-app/dist/components/InfoField.js';
import '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import type { ColumnDef, RichTableEventMap } from '@iyulab/data-components/dist/components/u-rich-table/types.js';

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
  },
  { key: 'total', label: 'Total', align: 'right', width: '120px' },
];

const ROWS = [
  { _id: '1', id: 'G-2026-0512', customer: 'Aster Trading', status: 'pending', total: '₩1,240,000' },
  { _id: '2', id: 'G-2026-0513', customer: 'Blue Harbor Co.', status: 'shipped', total: '₩380,500' },
  { _id: '3', id: 'G-2026-0514', customer: 'Cedar & Finch', status: 'delivered', total: '₩92,000' },
  { _id: '4', id: 'G-2026-0515', customer: 'Aster Trading', status: 'pending', total: '₩2,010,000' },
];

/**
 * §4 Data visualization & patterns.
 *
 * Graded the blueprint's biggest gap. The gap is uneven within the category itself:
 * data-representation primitives (below, "Data representation") and the list-screen
 * assembly (below, "List screen") are both real, running components. Edit-form and
 * timeline kits are not — grepping this repo for either returns nothing, so that gap
 * is named plainly rather than demoed with components that don't exist.
 */
@customElement('house-data-patterns-section')
export class DataPatternsSection extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @state() private selectedCount = 0;

  private handleSelectionChange(e: RichTableEventMap['selection-change']) {
    this.selectedCount = e.detail.selectedIds.length;
  }

  render() {
    return html`
      <section id="data-patterns">
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
            answer to "how do these already-built pieces fit together."
          </p>
          <u-rich-table
            .columns=${COLUMNS}
            .data=${ROWS}
            total-count="4"
            selectable
            filterable
            filter-placeholder="Filter…"
            filter-all-label="All statuses"
            @selection-change=${this.handleSelectionChange}
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

        <u-group-box title="Designed, not yet built">
          <p>
            An edit-form kit (drawer shell, grid-based field layout) — designed against
            a real "edit order details" panel, not started.
          </p>
          <p>
            A status-history timeline — a chronological event display primitive with no
            existing component to build on, not started.
          </p>
        </u-group-box>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-data-patterns-section': DataPatternsSection;
  }
}
