import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/modern-app/dist/components/MasterDetailLayout.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import '@iyulab/modern-app/dist/components/InfoField.js';
import '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import type { RichTableEventMap } from '@iyulab/data-components/dist/components/u-rich-table/types.js';
import type { URichTable } from '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';

import { COLUMNS, ROWS, renderStatusBadge } from './constants.js';

/**
 * `u-master-detail-layout` doesn't manage selection — it only shows or hides its
 * `detail` slot depending on whether that slot has content. Which record fills it is
 * the host's decision. `u-rich-table`'s only selection signal today is checkbox-based
 * `selection-change` (there's no row-click "activate" event yet), so this demo treats
 * "exactly one row checked" as the signal to open a detail pane.
 */
@customElement('house-data-patterns-master-detail')
export class MasterDetailDemo extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @state() private selectedId: string | null = null;

  private handleSelectionChange(e: RichTableEventMap['selection-change']) {
    const ids = e.detail.selectedIds;
    this.selectedId = ids.length === 1 ? String(ids[0]) : null;
  }

  private get selectedRow() {
    return ROWS.find(row => row._id === this.selectedId);
  }

  /**
   * The overlay close button only fires `detail-close` — it doesn't clear the slot
   * itself (the layout doesn't own selection, so it has nothing to clear). The host
   * clears its own state and also clears the table's checkbox, so the two stay in sync.
   */
  private handleClose() {
    this.selectedId = null;
    this.querySelector<URichTable>('#master-detail-table')?.clearSelection();
  }

  render() {
    return html`
      <u-master-detail-layout
        style="height: 22rem"
        overlay-breakpoint="640"
        @detail-close=${this.handleClose}
      >
        <u-rich-table
          id="master-detail-table"
          .columns=${COLUMNS}
          .data=${ROWS}
          .totalCount=${ROWS.length}
          selectable
          @selection-change=${this.handleSelectionChange}
        ></u-rich-table>
        ${this.selectedRow ? html`
          <div slot="detail" style="padding: var(--u-space-lg, 16px)">
            <u-info-section min="140">
              <u-info-field label="Order" .value=${this.selectedRow.id}></u-info-field>
              <u-info-field label="Customer" .value=${this.selectedRow.customer}></u-info-field>
              <u-info-field label="Total" .value=${this.selectedRow.total}></u-info-field>
            </u-info-section>
            ${renderStatusBadge(this.selectedRow.status)}
          </div>
        ` : ''}
      </u-master-detail-layout>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-data-patterns-master-detail': MasterDetailDemo;
  }
}
