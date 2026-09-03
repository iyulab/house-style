import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/components/dist/components/badge/UBadge.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import type { RichTableEventMap, FilterState } from '@iyulab/data-components/dist/components/u-rich-table/types.js';
import type { URichTable } from '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';

import { COLUMNS, ROWS } from './constants.js';

/**
 * List screen recipe. `u-rich-table` renders the filter row and emits `filter-change`,
 * but does not filter its own `.data` — that's the host's job (the same contract
 * server-paged consumers rely on to turn a filter into an API query instead of a
 * client-side operation). This demo's data is static, so filtering happens here.
 */
@customElement('house-data-patterns-list-screen')
export class ListScreenDemo extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @state() private selectedCount = 0;
  @state() private filters: FilterState = {};
  @state() private cancelMessage = '';

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

  /**
   * Simulates an API refetch — a real implementation would re-request `.data` here.
   * This demo's refetch also clears any existing status message as a side effect,
   * modeling a common shape: one view-state object holds both the rows and the status
   * line, and refetching replaces the whole object. That's exactly why the success
   * message below is set *after* this call returns, not before — setting it first
   * would have this "refetch" immediately erase it.
   */
  private simulateRefetch() {
    this.cancelMessage = '';
  }

  private handleCancelOrders() {
    this.querySelector<URichTable>('#list-screen-table')?.clearSelection();
    this.selectedCount = 0;
    this.simulateRefetch();
    this.cancelMessage = 'Selected orders canceled.';
  }

  render() {
    return html`
      <u-rich-table
        id="list-screen-table"
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
                   <u-button size="sm" color="danger" variant="outlined" @click=${this.handleCancelOrders}>Cancel orders</u-button>`
            : ''}
        </span>
      </u-rich-table>
      ${this.cancelMessage ? html`<p>${this.cancelMessage}</p>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-data-patterns-list-screen': ListScreenDemo;
  }
}
