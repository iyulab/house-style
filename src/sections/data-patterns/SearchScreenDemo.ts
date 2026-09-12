import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/components/dist/components/input/UInput.js';
import '@iyulab/components/dist/components/select/USelect.js';
import '@iyulab/components/dist/components/option/UOption.js';
import '@iyulab/components/dist/components/date-picker/UDatePicker.js';
import '@iyulab/components/dist/components/field/UField.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/components/dist/components/alert/UAlert.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import '@iyulab/modern-app/dist/components/EmptyState.js';
import '@iyulab/modern-app/dist/components/ActionBar.js';
import '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import type { ColumnDef } from '@iyulab/data-components/dist/components/u-rich-table/types.js';
import type { UInput } from '@iyulab/components/dist/components/input/UInput.js';
import type { USelect } from '@iyulab/components/dist/components/select/USelect.js';
import type { UDatePicker } from '@iyulab/components/dist/components/date-picker/UDatePicker.js';

import { PAGED_ROWS, PAGED_PAGE_SIZE, renderStatusBadge } from './constants.js';

/**
 * Search screen recipe — the shape most internal line-of-business screens take:
 * a criteria form, a search that queries the server, and a server-paged result table.
 *
 * Two things this demo is deliberately showing, because they are the decisions a
 * consumer has to make and neither is visible from the component APIs alone:
 *
 * 1. **The criteria form is the same `u-info-section` + `u-field` grid the edit-form
 *    recipe uses.** Reusing it is what keeps labels from colliding when a select is
 *    narrow — hand-rolled `display:flex; flex-wrap:wrap` criteria rows are where that
 *    goes wrong. The difference from an edit form is behavioural, not structural:
 *    nothing here is `required`, nothing validates, and the primary action searches
 *    rather than saves.
 *
 * 2. **Criteria form and the table's own filter row are alternatives, not layers.**
 *    This screen turns the table's filter row off, because the criteria above already
 *    own the query. Running both means two places narrow the same result set and
 *    neither shows the whole condition.
 *
 * Every column declares an absolute width, which is what makes the declared widths
 * hold when there are more columns than fit (see `u-rich-table`'s column-width
 * contract). The shared demo table elsewhere on this page deliberately leaves one
 * column without a width — that is the other half of the same contract.
 */

const COLUMNS: ColumnDef[] = [
  { key: 'id', label: 'Order', width: '150px' },
  { key: 'customer', label: 'Customer', width: '180px' },
  { key: 'status', label: 'Status', width: '130px', render: renderStatusBadge },
  { key: 'total', label: 'Total', align: 'right', width: '140px' },
];

interface Criteria {
  keyword: string;
  status: string;
  from: string;
}

const EMPTY: Criteria = { keyword: '', status: '', from: '' };

@customElement('house-data-patterns-search-screen')
export class SearchScreenDemo extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  /** What the form currently holds — not yet a query. */
  @state() private draft: Criteria = { ...EMPTY };
  /** What the last search actually ran with. The table reflects this, never `draft`. */
  @state() private applied: Criteria | null = null;
  @state() private page = 1;
  @state() private message = '';

  /**
   * Stands in for the server call. A real screen sends `applied` plus the page number
   * and renders whatever comes back; the point of the split is that editing a field
   * does not move the table until Search is pressed.
   */
  private get results() {
    if (!this.applied) return [];
    const { keyword, status } = this.applied;
    return PAGED_ROWS.filter(row => {
      const matchesKeyword =
        !keyword || row.customer.toLowerCase().includes(keyword.toLowerCase()) ||
        row.id.toLowerCase().includes(keyword.toLowerCase());
      const matchesStatus = !status || row.status === status;
      return matchesKeyword && matchesStatus;
    });
  }

  private get pageRows() {
    const start = (this.page - 1) * PAGED_PAGE_SIZE;
    return this.results.slice(start, start + PAGED_PAGE_SIZE);
  }

  private search() {
    this.applied = { ...this.draft };
    // Changing the criteria always returns to page 1 — staying on page 4 of a result
    // set that no longer has four pages is the classic way this goes wrong.
    this.page = 1;
    this.message = `${this.results.length} orders found.`;
  }

  private reset() {
    this.draft = { ...EMPTY };
    this.applied = null;
    this.page = 1;
    this.message = '';
  }

  render() {
    const searched = this.applied !== null;
    return html`
      <u-info-section min="200">
        <u-field label="Keyword" description="Order number or customer">
          <u-input
            .value=${this.draft.keyword}
            placeholder="e.g. Aster"
            clearable
            @input=${(e: Event) => { this.draft = { ...this.draft, keyword: (e.target as UInput).value ?? '' }; }}
            @change=${(e: Event) => { this.draft = { ...this.draft, keyword: (e.target as UInput).value ?? '' }; }}
          ></u-input>
        </u-field>
        <u-field label="Status">
          <u-select
            .value=${this.draft.status}
            @change=${(e: Event) => {
              const v = (e.target as USelect).value;
              this.draft = { ...this.draft, status: (Array.isArray(v) ? v[0] : v) ?? '' };
            }}
          >
            <u-option value="">All statuses</u-option>
            <u-option value="pending">Pending</u-option>
            <u-option value="shipped">Shipped</u-option>
            <u-option value="delivered">Delivered</u-option>
          </u-select>
        </u-field>
        <u-field label="Ordered from">
          <u-date-picker
            .value=${this.draft.from}
            clearable
            @change=${(e: Event) => { this.draft = { ...this.draft, from: (e.target as UDatePicker).value ?? '' }; }}
          ></u-date-picker>
        </u-field>
      </u-info-section>

      <u-action-bar>
        <u-button variant="ghost" @click=${this.reset}>Reset</u-button>
        <u-button color="primary" @click=${this.search}>Search</u-button>
      </u-action-bar>

      ${this.message
        ? html`<u-alert open status="info" variant="outlined">${this.message}</u-alert>`
        : ''}

      ${!searched
        ? html`
            <u-empty-state
              variant="no-data"
              title="Set your criteria and search"
              description="Results appear here once a search runs."
            ></u-empty-state>
          `
        : this.results.length === 0
          ? html`
              <u-empty-state variant="no-results">
                <span slot="actions">
                  <u-button size="sm" variant="outlined" @click=${this.reset}>Reset criteria</u-button>
                </span>
              </u-empty-state>
            `
          : html`
              <u-rich-table
                .columns=${COLUMNS}
                .data=${this.pageRows}
                .totalCount=${this.results.length}
                .pageSize=${PAGED_PAGE_SIZE}
                .currentPage=${this.page}
                @page-change=${(e: CustomEvent<{ page: number }>) => { this.page = e.detail.page; }}
              ></u-rich-table>
            `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-data-patterns-search-screen': SearchScreenDemo;
  }
}
