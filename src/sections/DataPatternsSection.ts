import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/components/dist/components/date-picker/UDatePicker.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/components/dist/components/badge/UBadge.js';
import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import '@iyulab/modern-app/dist/components/InfoField.js';
import '@iyulab/modern-app/dist/components/EmptyState.js';
import '@iyulab/data-components/dist/components/u-rich-table/URichTable.js';
import '@iyulab/data-components/dist/components/u-record-picker/URecordPicker.js';
import type { ColumnDef } from '@iyulab/data-components/dist/components/u-rich-table/types.js';
import type { PickerItem } from '@iyulab/data-components/dist/components/u-record-picker/types.js';

import './data-patterns/ListScreenDemo.js';
import './data-patterns/CrossPageSelectionDemo.js';
import './data-patterns/MasterDetailDemo.js';
import './data-patterns/FilterEmptyStateDemo.js';
import './data-patterns/EditFormDemo.js';

/**
 * Capabilities the UI names but hasn't built yet. A missing feature checked against
 * this set renders disabled with an explanation, rather than being hidden or omitted
 * — an omitted button leaves a user wondering whether the capability exists at all;
 * a disabled one with no explanation leaves them wondering why. This demo's set is
 * static; a real one would come from a feature-flag or entitlement check.
 */
const MISSING_FEATURES = new Set(['export-accounting', 'bulk-print']);

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

const DEMO_CUSTOMERS: (PickerItem & { email: string })[] = [
  { id: 'c1', label: 'Acme Corp', email: 'ops@acme.example' },
  { id: 'c2', label: 'Beta Industries', email: 'hello@beta.example' },
  { id: 'c3', label: 'Cascade Logistics', email: 'contact@cascade.example' },
  { id: 'c4', label: 'Delta Freight', email: 'info@delta.example' },
];

const searchDemoCustomers = async (query: string): Promise<PickerItem[]> => {
  const q = query.toLowerCase();
  return DEMO_CUSTOMERS.filter((c) => c.label.toLowerCase().includes(q));
};

/**
 * §4 Data visualization & patterns.
 *
 * Graded the blueprint's biggest gap. The gap is uneven within the category itself:
 * data representation, the list screen (with its status-badge convention and empty-state
 * pairing), the related-records (1:N) recipe, and the edit-form assembly are all real,
 * running compositions of already-shipped components — none of them required a new
 * house-style-specific component. The status-history timeline is the one remaining
 * piece, and it stays undecided on purpose — see the section below.
 *
 * Recipes with their own reactive state (list screen, cross-page selection,
 * master›detail, the filter empty-state, and the edit form) live as dedicated
 * sub-components in `data-patterns/` — this class composes them and carries the
 * narrative around each one, plus the recipes that are pure static markup.
 */
@customElement('house-data-patterns-section')
export class DataPatternsSection extends LitElement {
  protected createRenderRoot() {
    return this;
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
          <p>
            This demo loads the full OData result set once and filters client-side —
            <code>u-rich-table</code> fits small-to-medium, row-CRUD-focused lists like this
            one. For large datasets that need true server-side paging and cell-level
            editing, see <code>@iyulab/flex-table</code> instead.
          </p>
          <house-data-patterns-list-screen></house-data-patterns-list-screen>
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
          <house-data-patterns-cross-page-selection></house-data-patterns-cross-page-selection>
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
          <house-data-patterns-master-detail></house-data-patterns-master-detail>
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
          <house-data-patterns-filter-empty-state></house-data-patterns-filter-empty-state>
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

        <u-group-box title="Record picker — filter / lookup">
          <p>
            <code>u-record-picker</code> is one component with two entry points into the same
            <code>search</code> callback. Typing filters an inline dropdown (partial-match list →
            select). Enter with nothing highlighted, or the trailing find button, opens a modal
            lookup — a search bar plus <code>u-rich-table</code> — for browsing a larger result
            set. A single click on a row in that dialog only previews it (the dialog stays open);
            Confirm or a row double-click commits the pick. The component owns none of the
            matching logic — that lives entirely in the <code>search</code> callback passed in
            below.
          </p>
          <u-record-picker
            label="Customer"
            placeholder="Type to search…"
            clearable
            .search=${searchDemoCustomers}
            .columns=${[
              { key: 'label', label: 'Company' },
              { key: 'email', label: 'Email' },
            ]}
          ></u-record-picker>
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
          <house-data-patterns-edit-form></house-data-patterns-edit-form>
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
