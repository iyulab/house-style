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
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import '@iyulab/modern-app/dist/components/InfoField.js';
import '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import type { ColumnDef, RichTableEventMap } from '@iyulab/data-components/dist/components/u-rich-table/types.js';
import type { UDrawer } from '@iyulab/components/dist/components/drawer/UDrawer.js';

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
 * data representation, the list screen and the edit-form assembly (below) are all
 * real, running compositions of already-shipped components — none of them required
 * a new house-style-specific component. The status-history timeline is the one
 * remaining piece, and it stays undecided on purpose — see the section below.
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

  private openEditDrawer() {
    this.querySelector<UDrawer>('#edit-drawer')?.show();
  }

  private closeEditDrawer() {
    this.querySelector<UDrawer>('#edit-drawer')?.hide();
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
            .totalCount=${4}
            selectable
            filterable
            .filterPlaceholder=${'Filter…'}
            .filterAllLabel=${'All statuses'}
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
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-data-patterns-section': DataPatternsSection;
  }
}
