import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';

/**
 * §5 User flows (CRUD / Wizard / Bulk).
 *
 * Graded "partial" — described only, no live demo here. Pulling in a table
 * component just to stage one selection interaction would widen this page's
 * dependency surface for a payoff smaller than the honest paragraph below.
 */
@customElement('house-flows-section')
export class FlowsSection extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <u-page-header
        title="User flows"
        subtitle="CRUD, wizard, and bulk-action patterns"
      ></u-page-header>

      <u-group-box title="Built">
        <p>
          Row-selection state consistency and a <code>select-all</code> event landed
          in the rich-table component — the building block a bulk-action flow needs,
          not the flow itself.
        </p>
      </u-group-box>

      <u-group-box title="Not yet decided">
        <p>
          There is no documented criterion yet for when an edit action should open a
          modal, a slide-over panel, or a dedicated page. Wizard and draft-save
          patterns are out of scope for now — no measured demand for them exists yet.
        </p>
      </u-group-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-flows-section': FlowsSection;
  }
}
