import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/components/dist/components/date-picker/UDatePicker.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import '@iyulab/modern-app/dist/components/InfoField.js';

/**
 * §4 Data visualization & patterns.
 *
 * Graded the blueprint's biggest gap. Within the category itself the gap is uneven:
 * the data-representation primitives (this section's live demo) landed; the larger
 * assembled kits below did not — grepping `modern-app`/`data-components`/`enterprise`
 * for a list-screen kit, an edit-form kit, or a status timeline returns nothing, so
 * this section says so plainly instead of demoing components that don't exist.
 */
@customElement('house-data-patterns-section')
export class DataPatternsSection extends LitElement {
  protected createRenderRoot() {
    return this;
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

        <u-group-box title="Designed, not yet built">
          <p>
            A list-screen kit (filter bar, table, bulk actions) — designed against a
            real "order management" reference screen, not started.
          </p>
          <p>
            An edit-form kit (drawer shell, grid-based field layout) — designed against
            a real "edit order details" panel, not started.
          </p>
          <p>
            A status-history timeline — a chronological event display primitive with no
            existing component to build on, not started.
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
