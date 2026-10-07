import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createArraySource } from '@iyulab/flex-table/array';

import '@iyulab/enterprise/list-page';
import '@iyulab/components/dist/components/badge/UBadge.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/components/dist/components/input/UInput.js';
import '@iyulab/components/dist/components/select/USelect.js';
import '@iyulab/components/dist/components/option/UOption.js';
import '@iyulab/components/dist/components/pagination/UPagination.js';
import '@iyulab/modern-app/dist/components/EmptyState.js';
import '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import '@iyulab/data-components/dist/components/data-view/UDataView.js';
import type { USelect } from '@iyulab/components/dist/components/select/USelect.js';
import type { URichTable } from '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import type { RichTableEventMap } from '@iyulab/data-components/dist/components/u-rich-table/types.js';

import { COLUMNS, PAGED_ROWS, PAGED_PAGE_SIZE, renderOrderCard } from './constants.js';

/**
 * List screen recipe. `u-list-page` binds one data source to the table, the cards and the pager, and turns the search
 * box's `search` into the source's search — the screen only says what is on it. Here the rows are already loaded
 * (`createArraySource`); for a server list, `createODataSource` from `@iyulab/flex-table/odata` takes its place.
 */
@customElement('house-data-patterns-list-screen')
export class ListScreenDemo extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  private orders = createArraySource(PAGED_ROWS, { pageSize: PAGED_PAGE_SIZE, searchFields: row => [row.id, row.customer] });
  @state() private view = 'table';
  @state() private selected = 0;
  @state() private message = '';

  /** Status is this screen's own criterion: it narrows the rows the source sees. */
  private filterStatus(e: Event) {
    const status = (e.target as USelect).value;
    this.orders.update(status ? PAGED_ROWS.filter(row => row.status === status) : PAGED_ROWS, { pageSize: PAGED_PAGE_SIZE });
  }

  private cancelSelected() {
    this.querySelector<URichTable>('u-rich-table')?.clearSelection();
    this.message = `${this.selected} orders canceled.`;
    this.selected = 0;
  }

  render() {
    return html`
      <u-list-page .source=${this.orders} view=${this.view}>
        <u-input slot="filters" type="search" label="Search" placeholder="Order or customer"></u-input>
        <u-select slot="filters" label="Status" value="" @change=${this.filterStatus}>
          <u-option value="">All statuses</u-option>
          <u-option value="pending">Pending</u-option>
          <u-option value="shipped">Shipped</u-option>
          <u-option value="delivered">Delivered</u-option>
        </u-select>
        <u-button slot="toolbar" size="sm" appearance="outlined" aria-pressed=${this.view === 'cards'}
          @click=${() => { this.view = this.view === 'table' ? 'cards' : 'table'; }}>Cards</u-button>
        <u-rich-table slot="view" view-name="table" aria-label="Orders" .columns=${COLUMNS} selectable hide-pagination
          @selection-change=${(e: RichTableEventMap['selection-change']) => { this.selected = e.detail.selectedIds.length; }}>
          <span slot="bulk-actions">
            ${this.selected > 0
              ? html`<u-badge color="primary">${this.selected} selected</u-badge>
                     <u-button size="sm" color="danger" appearance="outlined" @click=${this.cancelSelected}>Cancel orders</u-button>`
              : ''}
          </span>
        </u-rich-table>
        <u-data-view slot="view" view-name="cards" hide-toolbar .renderCard=${renderOrderCard}></u-data-view>
        <u-pagination slot="pager" label="Orders pages"></u-pagination>
        <u-empty-state slot="empty" variant="no-results" title="No orders match"></u-empty-state>
      </u-list-page>
      ${this.message ? html`<p role="status">${this.message}</p>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-data-patterns-list-screen': ListScreenDemo;
  }
}
