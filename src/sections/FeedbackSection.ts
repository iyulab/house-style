import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/components/dist/components/alert/UAlert.js';
import '@iyulab/components/dist/components/progress-bar/UProgressBar.js';
import '@iyulab/components/dist/components/skeleton/USkeleton.js';
import '@iyulab/components/dist/components/spinner/USpinner.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import '@iyulab/modern-app/dist/components/InfoField.js';

/**
 * §6 State feedback & motion.
 *
 * Graded "partial" — the individual pieces exist and are shown live below;
 * what's missing is a single place that says which one to reach for.
 */
@customElement('house-feedback-section')
export class FeedbackSection extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <section id="feedback">
        <u-group-box title="Feedback">
          <u-alert open status="info" title="Informational">Nothing needs your attention.</u-alert>
          <u-alert open status="success" title="Saved">The record was updated.</u-alert>
          <u-alert open status="warning" title="Review needed">Two fields fall back to defaults.</u-alert>
          <u-alert open status="error" title="Failed" closable>The upstream service did not respond.</u-alert>
        </u-group-box>

        <u-group-box title="Progress and waiting">
          <u-info-section min="220">
            <u-info-field label="Determinate"><u-progress-bar value="64" rounded></u-progress-bar></u-info-field>
            <u-info-field label="Indeterminate"><u-progress-bar indeterminate rounded></u-progress-bar></u-info-field>
            <u-info-field label="Spinner"><u-spinner></u-spinner></u-info-field>
            <u-info-field label="Skeleton"><u-skeleton lines="3"></u-skeleton></u-info-field>
          </u-info-section>
        </u-group-box>

        <u-group-box title="Not yet decided">
          <p>
            There is no documented hierarchy yet for choosing between a toast, an alert
            banner, and a modal, and motion duration/easing values exist scattered
            across the codebase rather than standardized in one place.
          </p>
        </u-group-box>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-feedback-section': FeedbackSection;
  }
}
