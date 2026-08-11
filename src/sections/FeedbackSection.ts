import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/components/dist/components/alert/UAlert.js';
import '@iyulab/components/dist/components/progress-bar/UProgressBar.js';
import '@iyulab/components/dist/components/skeleton/USkeleton.js';
import '@iyulab/components/dist/components/spinner/USpinner.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import '@iyulab/modern-app/dist/components/InfoField.js';

/**
 * Wraps an async action with busy-state bookkeeping — the shape every async handler
 * in this app hand-rolls otherwise: flip a busy flag on, run the request, flip it off
 * in a `finally` so a thrown error still clears it (the Edit-form Save handler in
 * Data patterns does this by hand today). A plain function is the smallest unit that
 * solves the repeated shape — a mixin/base-class would only earn its keep once enough
 * call sites needed the same lifecycle wired into shared state, which is component-
 * library territory, not a house-style recipe's scope.
 */
async function withBusyState(setBusy: (busy: boolean) => void, action: () => Promise<void>): Promise<void> {
  setBusy(true);
  try {
    await action();
  } finally {
    setBusy(false);
  }
}

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

  @state() private demoBusy = false;
  @state() private demoRefreshedAt: string | null = null;

  private handleRefresh() {
    return withBusyState(busy => { this.demoBusy = busy; }, async () => {
      await new Promise<void>(resolve => setTimeout(resolve, 600));
      this.demoRefreshedAt = new Date().toLocaleTimeString();
    });
  }

  render() {
    return html`
      <u-page-header
        title="Feedback & motion"
        subtitle="Alerts, progress, and waiting states"
      ></u-page-header>

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

      <u-group-box title="Busy-state wrapper — one helper for the async lifecycle">
        <p>
          Every async action elsewhere on this site (Save, Cancel orders in Data
          patterns) hand-rolls the same three steps: flip a busy flag on, run the
          request, flip it off — in a <code>finally</code> so a thrown error still
          clears it. <code>withBusyState()</code> pulls that shape out once. It's a
          plain function, not a new component: a mixin/base-class would only earn its
          keep once enough call sites needed the same lifecycle wired into shared
          state, which is component-library territory, not this recipe's scope.
        </p>
        <u-button variant="outlined" ?disabled=${this.demoBusy} @click=${this.handleRefresh}>
          ${this.demoBusy ? html`<u-spinner></u-spinner> Refreshing…` : 'Refresh'}
        </u-button>
        ${this.demoRefreshedAt ? html`<p><small>Last refreshed at ${this.demoRefreshedAt}.</small></p>` : ''}
      </u-group-box>

      <u-group-box title="Not yet decided">
        <p>
          There is no documented hierarchy yet for choosing between a toast, an alert
          banner, and a modal, and motion duration/easing values exist scattered
          across the codebase rather than standardized in one place.
        </p>
      </u-group-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-feedback-section': FeedbackSection;
  }
}
