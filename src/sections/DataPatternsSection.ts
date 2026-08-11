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
import '@iyulab/modern-app/dist/components/MasterDetailLayout.js';
import '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import type { ColumnDef, FilterState, RichTableEventMap } from '@iyulab/data-components/dist/components/u-rich-table/types.js';
import type { UDrawer } from '@iyulab/components/dist/components/drawer/UDrawer.js';
import type { UInput } from '@iyulab/components/dist/components/input/UInput.js';
import type { USelect } from '@iyulab/components/dist/components/select/USelect.js';
import type { URichTable } from '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';

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

/** A server-shaped error — has a message worth showing the user as-is. */
interface ApiError { code: string; message: string; }

function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'code' in value && 'message' in value;
}

/**
 * Capabilities the UI names but hasn't built yet. A missing feature checked against
 * this set renders disabled with an explanation, rather than being hidden or omitted
 * — an omitted button leaves a user wondering whether the capability exists at all;
 * a disabled one with no explanation leaves them wondering why. This demo's set is
 * static; a real one would come from a feature-flag or entitlement check.
 */
const MISSING_FEATURES = new Set(['export-accounting', 'bulk-print']);

const PAGED_PAGE_SIZE = 5;
const PAGED_ROWS = Array.from({ length: 12 }, (_, i) => ({
  _id: `p-${i + 1}`,
  id: `G-2026-${(600 + i).toString().padStart(4, '0')}`,
  customer: ['Aster Trading', 'Blue Harbor Co.', 'Cedar & Finch', 'Driftwood Supply'][i % 4],
  status: ['pending', 'shipped', 'delivered'][i % 3],
  total: `₩${((i + 1) * 87000).toLocaleString()}`,
}));

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

  @state() private cancelMessage = '';

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
   * `selection-change`'s `detail.selectedIds` is cumulative across every page visited
   * so far; `detail.selectedRows` only covers the current page (the component can't
   * return rows it doesn't have). This recipe reads the cumulative id list to show a
   * bulk-action count that survives page navigation.
   */
  @state() private pagedCurrentPage = 1;
  @state() private pagedSelectedIds: string[] = [];

  private get pagedPageRows() {
    const start = (this.pagedCurrentPage - 1) * PAGED_PAGE_SIZE;
    return PAGED_ROWS.slice(start, start + PAGED_PAGE_SIZE);
  }

  private get pagedSelectedOnPageCount() {
    const pageIds = new Set(this.pagedPageRows.map(row => row._id));
    return this.pagedSelectedIds.filter(id => pageIds.has(id)).length;
  }

  private handlePagedSelectionChange(e: RichTableEventMap['selection-change']) {
    this.pagedSelectedIds = e.detail.selectedIds;
  }

  private handlePagedPageChange(e: RichTableEventMap['page-change']) {
    this.pagedCurrentPage = e.detail.page;
  }

  /**
   * `u-master-detail-layout` doesn't manage selection — it only shows or hides its
   * `detail` slot depending on whether that slot has content. Which record fills it is
   * the host's decision. `u-rich-table`'s only selection signal today is checkbox-based
   * `selection-change` (there's no row-click "activate" event yet), so this demo treats
   * "exactly one row checked" as the signal to open a detail pane.
   */
  @state() private masterDetailSelectedId: string | null = null;

  private handleMasterDetailSelectionChange(e: RichTableEventMap['selection-change']) {
    const ids = e.detail.selectedIds;
    this.masterDetailSelectedId = ids.length === 1 ? String(ids[0]) : null;
  }

  private get masterDetailSelectedRow() {
    return ROWS.find(row => row._id === this.masterDetailSelectedId);
  }

  /**
   * The overlay close button only fires `detail-close` — it doesn't clear the slot
   * itself (the layout doesn't own selection, so it has nothing to clear). The host
   * clears its own state and also clears the table's checkbox, so the two stay in sync.
   */
  private handleMasterDetailClose() {
    this.masterDetailSelectedId = null;
    this.querySelector<URichTable>('#master-detail-table')?.clearSelection();
  }

  private openEditDrawer() {
    this.saveStatus = 'idle';
    this.saveError = null;
    this.querySelector<UDrawer>('#edit-drawer')?.show();
  }

  private closeEditDrawer() {
    this.querySelector<UDrawer>('#edit-drawer')?.hide();
  }

  @state() private saveScenario: 'ok' | 'api-error' | 'network-error' = 'ok';
  @state() private saveStatus: 'idle' | 'saving' | 'error' = 'idle';
  @state() private saveError: string | null = null;

  /**
   * Stands in for a real API call. `'api-error'` rejects with a server-shaped error
   * (has a `message` worth showing as-is); `'network-error'` rejects with a raw
   * `TypeError`, the same shape a failed `fetch()` throws — never something to show a
   * user directly.
   */
  private simulateSaveRequest(scenario: typeof this.saveScenario): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (scenario === 'api-error') {
          reject({ code: 'VALIDATION_ERROR', message: 'Delivery date must be after the order date.' } satisfies ApiError);
        } else if (scenario === 'network-error') {
          reject(new TypeError('Failed to fetch'));
        } else {
          resolve();
        }
      }, 10);
    });
  }

  /**
   * The two-tier split this recipe demonstrates: a typed API error carries a
   * server-provided message worth showing as-is; anything else (a raw `TypeError`
   * from a failed `fetch`, or any other exception shape) becomes one generic message
   * — the user never sees a raw exception string.
   */
  private async handleSave() {
    this.saveStatus = 'saving';
    this.saveError = null;
    try {
      await this.simulateSaveRequest(this.saveScenario);
      this.closeEditDrawer();
    } catch (err) {
      this.saveStatus = 'error';
      this.saveError = isApiError(err) ? err.message : 'Something went wrong. Please try again.';
      return;
    }
    this.saveStatus = 'idle';
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

        <u-group-box title="KPI dashboard — stat tiles, not a dedicated component">
          <p>
            No dedicated "stat tile" component exists here either — this is
            <code>u-info-field</code> again, in its <code>size="lg"</code> mode, arranged
            in the same <code>u-info-section</code> grid as above. A dashboard header is a
            "tile strip": each tile owns exactly one number, its label, and an optional
            trend — the pattern common to Stripe, Linear, and Vercel's own dashboards.
          </p>
          <u-info-section min="180">
            <u-info-field label="Orders today" size="lg" .value=${24} trend="up" trendLabel="+12% vs yesterday"></u-info-field>
            <u-info-field label="Revenue today" size="lg" format="currency" currency="KRW" .value=${12450000} trend="up" trendLabel="+8% vs yesterday"></u-info-field>
            <u-info-field label="Pending orders" size="lg" .value=${7} trend="down" trendLabel="−3 vs yesterday" tone="positive"></u-info-field>
            <u-info-field label="Avg. fulfillment" size="lg" .value=${'2.4 days'} trend="flat" trendLabel="No change"></u-info-field>
          </u-info-section>
          <p>
            The third tile is why <code>tone</code> exists as its own prop, separate from
            <code>trend</code>: a falling pending-order count is a downward trend, but it's
            good news, so the tone is overridden to <code>positive</code> instead of the
            auto-inferred <code>negative</code>.
          </p>
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
        </u-group-box>

        <u-group-box title="Cross-page selection — the bulk-action count isn't what's checked">
          <p>
            <code>selection-change</code>'s <code>detail.selectedIds</code> is cumulative
            across every page visited so far; <code>detail.selectedRows</code> only covers
            the current page, because the component can't return rows it doesn't have.
            Select a row or two, page forward, and select more — the total below keeps
            counting the earlier page's picks even though this page's checkboxes start
            unchecked.
          </p>
          <p>
            <strong>${this.pagedSelectedIds.length}</strong> selected across all pages ·
            <strong>${this.pagedSelectedOnPageCount}</strong> checked on this page
          </p>
          <u-rich-table
            .columns=${COLUMNS}
            .data=${this.pagedPageRows}
            .totalCount=${PAGED_ROWS.length}
            .pageSize=${PAGED_PAGE_SIZE}
            .currentPage=${this.pagedCurrentPage}
            selectable
            @selection-change=${this.handlePagedSelectionChange}
            @page-change=${this.handlePagedPageChange}
          ></u-rich-table>
        </u-group-box>

        <u-group-box title="Master›detail — a list and its record detail, side by side">
          <p>
            <code>u-master-detail-layout</code> (a Vaadin <code>MasterDetailLayout</code>-style
            split-pane shell) doesn't manage selection either — it only shows its
            <code>detail</code> slot when that slot has content, and hides it when empty.
            Which record fills it is the host's decision, wired the same way the bulk-action
            bar above is: by reading <code>u-rich-table</code>'s <code>selection-change</code>
            event. Check exactly one row to open its detail pane. Narrow this window (or
            resize the browser) below the layout's own <code>overlay-breakpoint</code> and the
            detail pane switches from a side panel to a full overlay with a close button —
            that's the component's own responsive behavior, not extra code here.
          </p>
          <u-master-detail-layout
            style="height: 22rem"
            overlay-breakpoint="640"
            @detail-close=${this.handleMasterDetailClose}
          >
            <u-rich-table
              id="master-detail-table"
              .columns=${COLUMNS}
              .data=${ROWS}
              .totalCount=${ROWS.length}
              selectable
              @selection-change=${this.handleMasterDetailSelectionChange}
            ></u-rich-table>
            ${this.masterDetailSelectedRow ? html`
              <div slot="detail" style="padding: var(--u-space-lg, 16px)">
                <u-info-section min="140">
                  <u-info-field label="Order" .value=${this.masterDetailSelectedRow.id}></u-info-field>
                  <u-info-field label="Customer" .value=${this.masterDetailSelectedRow.customer}></u-info-field>
                  <u-info-field label="Total" .value=${this.masterDetailSelectedRow.total}></u-info-field>
                </u-info-section>
                ${renderStatusBadge(this.masterDetailSelectedRow.status)}
              </div>
            ` : ''}
          </u-master-detail-layout>
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
            clearable
            .value=${this.filterText}
            @input=${(e: Event) => { this.filterText = (e.target as UInput).value ?? ''; }}
            @change=${(e: Event) => { this.filterText = (e.target as UInput).value ?? ''; }}
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
          <p>
            Saving also demonstrates a two-tier error split: a typed API error (a
            server-shaped <code>{ code, message }</code>) shows its <code>message</code>
            as-is, because the server wrote it to be read. Anything else — a raw
            <code>TypeError</code> from a failed <code>fetch</code>, or any other
            exception shape — collapses to one generic sentence instead. Pick a
            scenario below, then Save, to see both.
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
              <u-field label="Simulate save result" description="Demo control — not part of the recipe">
                <u-select
                  .value=${this.saveScenario}
                  @change=${(e: Event) => {
                    const value = (e.target as USelect).value;
                    this.saveScenario = (Array.isArray(value) ? value[0] : value) as typeof this.saveScenario;
                  }}
                >
                  <u-option value="ok">Success</u-option>
                  <u-option value="api-error">API validation error</u-option>
                  <u-option value="network-error">Network error</u-option>
                </u-select>
              </u-field>
            </u-info-section>
            ${this.saveStatus === 'error'
              ? html`<u-badge color="danger">${this.saveError}</u-badge>`
              : ''}
            <div slot="footer">
              <u-button variant="ghost" @click=${this.closeEditDrawer}>Cancel</u-button>
              <u-button color="primary" ?disabled=${this.saveStatus === 'saving'} @click=${this.handleSave}>
                ${this.saveStatus === 'saving' ? 'Saving…' : 'Save'}
              </u-button>
            </div>
          </u-drawer>
        </u-group-box>

        <u-group-box title="Unimplemented feature — shown, not hidden">
          <p>
            Two of the three actions below aren't built yet. They still render —
            disabled, with a reason attached — instead of disappearing from the
            toolbar. Whether a capability exists at all shouldn't be something a user
            has to guess from its absence.
          </p>
          <u-button variant="outlined" ?disabled=${MISSING_FEATURES.has('export-accounting')}>
            Export to accounting system
          </u-button>
          <u-button variant="outlined" ?disabled=${MISSING_FEATURES.has('bulk-print')}>
            Bulk print shipping labels
          </u-button>
          <u-button variant="outlined" ?disabled=${MISSING_FEATURES.has('archive')}>
            Archive selected
          </u-button>
          <p><small>Grayed-out actions above are planned, not hidden — not yet built.</small></p>
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
