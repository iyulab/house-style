import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import type { RichTableEventMap } from '@iyulab/data-components/dist/components/u-rich-table/types.js';

import { COLUMNS, PAGED_ROWS, PAGED_PAGE_SIZE } from './constants.js';

/**
 * `selection-change`'s `detail.selectedIds` is cumulative across every page visited
 * so far; `detail.selectedRows` only covers the current page (the component can't
 * return rows it doesn't have). This recipe reads the cumulative id list to show a
 * bulk-action count that survives page navigation.
 */
@customElement('house-data-patterns-cross-page-selection')
export class CrossPageSelectionDemo extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @state() private currentPage = 1;
  @state() private selectedIds: string[] = [];

  private get pageRows() {
    const start = (this.currentPage - 1) * PAGED_PAGE_SIZE;
    return PAGED_ROWS.slice(start, start + PAGED_PAGE_SIZE);
  }

  private get selectedOnPageCount() {
    const pageIds = new Set(this.pageRows.map(row => row._id));
    return this.selectedIds.filter(id => pageIds.has(id)).length;
  }

  private handleSelectionChange(e: RichTableEventMap['selection-change']) {
    this.selectedIds = e.detail.selectedIds;
  }

  private handlePageChange(e: RichTableEventMap['page-change']) {
    this.currentPage = e.detail.page;
  }

  render() {
    return html`
      <p>
        <strong>${this.selectedIds.length}</strong> selected across all pages ·
        <strong>${this.selectedOnPageCount}</strong> checked on this page
      </p>
      <u-rich-table
        .columns=${COLUMNS}
        .data=${this.pageRows}
        .totalCount=${PAGED_ROWS.length}
        .pageSize=${PAGED_PAGE_SIZE}
        .currentPage=${this.currentPage}
        selectable
        @selection-change=${this.handleSelectionChange}
        @page-change=${this.handlePageChange}
      ></u-rich-table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-data-patterns-cross-page-selection': CrossPageSelectionDemo;
  }
}
