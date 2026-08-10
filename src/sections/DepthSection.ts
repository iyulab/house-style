import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/components/dist/components/card/UCard.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';

/**
 * §3 Component graphics & depth.
 *
 * Graded "exists, not wired" — the same radius/elevation tokens shown in §1, this
 * time landing on real components instead of a bare swatch, which is the only way
 * a visitor without direct token access would ever encounter them.
 */
@customElement('house-depth-section')
export class DepthSection extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <u-page-header
        title="Component depth"
        subtitle="Surfaces and controls at the standard radius and elevation"
      ></u-page-header>

      <u-group-box title="Surfaces">
        <u-info-section min="220">
          <u-card>
            <strong slot="header">Default card</strong>
            Raised surface with the standard border and radius.
          </u-card>
          <u-card shadowless>
            <strong slot="header">Flat card</strong>
            Same box, no elevation — for dense lists.
          </u-card>
          <u-card hoverable>
            <strong slot="header">Interactive card</strong>
            Signals that the whole surface is a target.
          </u-card>
        </u-info-section>
      </u-group-box>

      <u-group-box title="Controls">
        <u-info-section min="140">
          <u-button color="primary">Primary</u-button>
          <u-button variant="outlined">Outlined</u-button>
          <u-button variant="ghost">Ghost</u-button>
        </u-info-section>
      </u-group-box>

      <u-group-box title="Not yet decided">
        <p>
          The current border weight on flat surfaces is a deliberate, already-settled
          choice, not an open question — it is kept as-is here.
        </p>
      </u-group-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-depth-section': DepthSection;
  }
}
