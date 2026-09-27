import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/components/dist/components/input/UInput.js';
import '@iyulab/components/dist/components/field/UField.js';
import '@iyulab/modern-app/dist/components/PageHeader.js';
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
      <u-page-header
        title="Voice, tone & accessibility"
        subtitle="Focus visibility, where focus lands, and keyboard interaction"
      ></u-page-header>

      <u-group-box level="2" title="Focus visibility">
        <u-info-section min="200">
          <u-field label="Focus me"><u-input placeholder="Tab to this field"></u-input></u-field>
        </u-info-section>
      </u-group-box>

      <u-group-box level="2" title="Keyboard interaction">
        <p>
          The date picker on the Data patterns page follows the WAI-ARIA Date Picker
          Dialog pattern — arrow keys move between days, Enter selects, Escape closes —
          built into the component rather than left for each consumer to implement.
        </p>
        <p>
          The component library ships its own contrast-ramp generation tooling,
          used when deriving new color ramps rather than picking values by eye.
        </p>
      </u-group-box>

      <u-group-box level="2" title="Where focus lands when a screen opens">
        <p>
          A screen whose job starts with typing — a scan field, a search box, a sign-in form, a
          new-record form — marks that one control with <code>autofocus</code>. Nothing else is
          needed: the app shell focuses it when the route finishes (through component shadow roots,
          after the screen has rendered, for Lit and React screens alike), and a modal
          <code>u-dialog</code> or <code>u-drawer</code> does the same when it opens. A screen that
          marks nothing gets the content area, so the keyboard scrolls it straight away.
        </p>
        <p>
          Two places move no focus on their own, by design: a route outside the shell (a sign-in
          page with no sidebar), and a <code>non-modal</code> drawer or dialog, which leaves the page
          behind it usable. There the screen calls <code>focus()</code> itself — the reference app's
          sign-in page does exactly that when its panel opens.
        </p>
        <p>
          Mark one control per screen, and only where typing is the first thing a person does — on a
          dashboard or a record page, pulling focus into a field skips everything a screen-reader
          user would otherwise hear first.
        </p>
      </u-group-box>

      <u-group-box level="2" title="Not yet decided">
        <p>
          There is no public-facing accessibility standard document yet (a minimum
          contrast ratio, a focus-ring specification) for consumers to reference, and
          no UX-writing glossary yet.
        </p>
      </u-group-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-voice-a11y-section': VoiceA11ySection;
  }
}
