import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/components/dist/components/card/UCard.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import { Dialog } from '@iyulab/components/dist/utilities/Dialog.js';

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

  private confirmCancel = () => {
    void Dialog.confirm('Cancel order G-2026-0512? This cannot be undone.', {
      title: 'Cancel order',
      confirmLabel: 'Cancel order',
      cancelLabel: 'Keep order',
      confirmColor: 'danger',
    });
  };

  render() {
    return html`
      <u-page-header
        title="Component depth"
        subtitle="Surfaces and controls at the standard radius and elevation"
      ></u-page-header>

      <u-group-box level="2" title="Surfaces">
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

      <u-group-box level="2" title="Action hierarchy — one primary per region">
        <p>
          Colour says <em>which</em> action this region exists for; the variant says how loud the
          others are. A screen where every button is a solid block has no hierarchy — the eye has
          nowhere to land. Note that a bare <code>&lt;u-button&gt;</code> is <strong>not</strong> a quiet
          button: its default colour, <code>neutral</code>, follows the brand colour, so it draws
          exactly like <code>color="primary"</code>. Give every non-primary action a variant.
        </p>
        <div class="table-scroll" role="region" aria-label="Action hierarchy" tabindex="0">
        <table>
          <!-- Declared widths — see the note on the same kind of table in Feedback & motion. -->
          <colgroup>
            <col style="width: 11rem" />
            <col style="width: 20rem" />
            <col />
          </colgroup>
          <thead>
            <tr><th>Role</th><th>Markup</th><th>When</th></tr>
          </thead>
          <tbody>
            <tr><td>Primary</td><td><code>appearance="solid"</code> (the default)</td><td>The one action the region exists for — Save, Create, Search. One per region.</td></tr>
            <tr><td>Secondary</td><td><code>appearance="outlined"</code></td><td>Other actions of the same region — Export, Back, "New order with items".</td></tr>
            <tr><td>Tertiary</td><td><code>appearance="plain"</code></td><td>Dismissive or low-stakes — Cancel in a form, Reset.</td></tr>
            <tr><td>Destructive</td><td><code>color="danger" appearance="outlined"</code></td><td>Deletes or cancels something. Never solid on the page.</td></tr>
            <tr><td>Destructive, per row</td><td>a row menu item, in a <code>flex-table</code> column with <code>reveal: 'hover'</code></td><td>Never a red button repeated on every row — the row's "more" menu holds Remove, the column shows only while the row is hovered, focused or selected, and the confirmation runs it.</td></tr>
            <tr><td>Destructive, confirmed</td><td><code>Dialog.confirm(…, { confirmColor: 'danger' })</code></td><td>The confirmation is the only place a destructive action is solid — and the only place it runs from.</td></tr>
          </tbody>
        </table>
        </div>
        <u-info-section min="140">
          <u-button color="primary">Save</u-button>
          <u-button appearance="outlined">Export</u-button>
          <u-button appearance="plain">Cancel</u-button>
          <u-button color="danger" appearance="outlined" @click=${this.confirmCancel}>Cancel order</u-button>
        </u-info-section>
      </u-group-box>

      <u-group-box level="2" title="Not yet decided">
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
