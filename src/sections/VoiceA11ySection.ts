import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/components/dist/components/input/UInput.js';
import '@iyulab/components/dist/components/field/UField.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';

/**
 * §7 Voice & tone + accessibility.
 *
 * Graded "partial" — a few concrete, already-built pieces shown live below;
 * the parts that would require inventing new normative content (a contrast
 * standard document, a writing glossary) are named as gaps, not filled in.
 */
@customElement('house-voice-a11y-section')
export class VoiceA11ySection extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <section id="voice-a11y">
        <u-group-box title="Focus visibility">
          <u-info-section min="200">
            <u-field label="Focus me"><u-input placeholder="Tab to this field"></u-input></u-field>
          </u-info-section>
        </u-group-box>

        <u-group-box title="Keyboard interaction">
          <p>
            The date picker above (§4) follows the WAI-ARIA Date Picker Dialog
            pattern — arrow keys move between days, Enter selects, Escape closes —
            built into the component rather than left for each consumer to implement.
          </p>
          <p>
            The component library ships its own contrast-ramp generation tooling,
            used when deriving new color ramps rather than picking values by eye.
          </p>
        </u-group-box>

        <u-group-box title="Not yet decided">
          <p>
            There is no public-facing accessibility standard document yet (a minimum
            contrast ratio, a focus-ring specification) for consumers to reference, and
            no UX-writing glossary yet.
          </p>
        </u-group-box>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-voice-a11y-section': VoiceA11ySection;
  }
}
