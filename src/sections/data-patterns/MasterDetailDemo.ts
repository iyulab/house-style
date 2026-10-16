import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/modern-app/dist/components/MasterDetailLayout.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import '@iyulab/modern-app/dist/components/InfoField.js';
import '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import type { RichTableEventMap } from '@iyulab/data-components/dist/components/u-rich-table/types.js';

import { COLUMNS, ROWS, renderStatusTag } from './constants.js';

/**
 * `u-master-detail-layout` doesn't manage selection — it only shows or hides its
 * `detail` slot depending on whether that slot has content. Which record fills it is
 * the host's decision: here `u-rich-table`'s `row-activate` (a click on a row, or Enter
 * on it) opens that row. Checking boxes stays a separate thing — bulk selection, not
 * "the record I'm looking at".
 *
 * `detail-size` gives the detail pane the fixed width and lets the list take the rest —
 * a wide list with a record summary beside it. No height is set: a real list is long and
 * its page scrolls, and the detail pane stays in view beside the row you picked.
 */
@customElement('house-data-patterns-master-detail')
export class MasterDetailDemo extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @state() private selectedId: string | null = null;

  private handleRowActivate(e: RichTableEventMap['row-activate']) {
    this.selectedId = e.detail.id;
  }

  private get selectedRow() {
    return ROWS.find(row => row._id === this.selectedId);
  }

  /**
   * The overlay close button only fires `detail-close` — it doesn't clear the slot
   * itself (the layout doesn't own selection, so it has nothing to clear).
   */
  private handleClose() {
    this.selectedId = null;
  }

  render() {
    return html`
      <u-master-detail-layout
        detail-size="18rem"
        overlay-breakpoint="640"
        @detail-close=${this.handleClose}
      >
        <u-rich-table
          aria-label="Orders"
          .columns=${COLUMNS}
          .data=${ROWS}
          .totalCount=${ROWS.length}
          @row-activate=${this.handleRowActivate}
        ></u-rich-table>
        ${this.selectedRow ? html`
          <div slot="detail" style="padding: var(--u-space-lg, 16px)">
            <u-info-section min="140">
              <u-info-field label="Order" .value=${this.selectedRow.id}></u-info-field>
              <u-info-field label="Customer" .value=${this.selectedRow.customer}></u-info-field>
              <u-info-field label="Total" .value=${this.selectedRow.total}></u-info-field>
            </u-info-section>
            ${renderStatusTag(this.selectedRow.status)}
          </div>
        ` : ''}
        <p slot="detail-placeholder" style="padding: var(--u-space-lg, 16px)">Open an order to see it here.</p>
      </u-master-detail-layout>
    `;
  }
}
