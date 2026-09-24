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
 * The pieces are shown live below, and the surface hierarchy that used to be
 * missing — toast vs. alert banner vs. modal — now sits with them, decided on the
 * axis of who ends the message rather than how urgent it feels. Motion
 * duration/easing is the remaining undecided item.
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

      <u-group-box level="2" title="Feedback">
        <u-alert open status="info" title="Informational">Nothing needs your attention.</u-alert>
        <u-alert open status="success" title="Saved">The record was updated.</u-alert>
        <u-alert open status="warning" title="Review needed">Two fields fall back to defaults.</u-alert>
        <u-alert open status="error" title="Failed" closable>The upstream service did not respond.</u-alert>
      </u-group-box>

      <u-group-box level="2" title="Progress and waiting">
        <u-info-section min="220">
          <u-info-field label="Determinate"><u-progress-bar value="64" rounded></u-progress-bar></u-info-field>
          <u-info-field label="Indeterminate"><u-progress-bar indeterminate rounded></u-progress-bar></u-info-field>
          <u-info-field label="Spinner"><u-spinner></u-spinner></u-info-field>
          <u-info-field label="Skeleton"><u-skeleton lines="3"></u-skeleton></u-info-field>
        </u-info-section>
      </u-group-box>

      <u-group-box level="2" title="Busy-state wrapper — one helper for the async lifecycle">
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

      <u-group-box level="2" title="Toast, banner, or modal — ask who ends it">
        <p>
          Three surfaces carry a message to the user, and the question that separates
          them is not how urgent it is. It is <strong>who ends it</strong>: time, the
          condition, or the user's decision. Pick by that and the choice stops being
          a matter of taste.
        </p>
        <div class="table-scroll" role="region" aria-label="Choosing a feedback surface" tabindex="0">
        <table>
          <!-- Declared widths, per §2's own rule: with \`overflow-wrap: anywhere\` inherited,
               a column's min-content is one character, so auto layout will squeeze a short
               cell until its header reads S/u/r/f/a/c/e. The wrapper scrolls instead. -->
          <colgroup>
            <col style="width: 8rem" />
            <col style="width: 15rem" />
            <col />
          </colgroup>
          <thead>
            <tr><th>Surface</th><th>Who ends it</th><th>Reach for it when</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>app.success</code></td>
              <td>Time — it dismisses itself after four seconds, and does not block.</td>
              <td>Confirming something the user just did, where missing the message
                  costs nothing because the result is already on screen.</td>
            </tr>
            <tr>
              <td><code>u-alert</code></td>
              <td>The condition, or the user. Set <code>duration="0"</code> so it does
                  not time out; it still does not block.</td>
              <td>A state that outlives one interaction. Either it clears itself when
                  the condition does (connection restored), or it stays until the user
                  acts on it (a new version is ready to load).</td>
            </tr>
            <tr>
              <td><code>u-dialog</code></td>
              <td>The user's decision — and it <strong>blocks</strong> until they make it.</td>
              <td>The user genuinely cannot continue until they choose. Blocking is the
                  whole cost of this surface — spend it only when carrying on would be
                  wrong, not merely when the message feels important.</td>
            </tr>
          </tbody>
        </table>
        </div>
        <p>
          <strong>A toast is not a quieter banner.</strong> It disappears on a timer, so
          anything the user must still act on a minute later cannot live in one — that
          is the line, not severity. An error can be a toast (the save failed, the form
          is still there) and an informational notice can be a banner (a new version is
          ready). <strong>And a banner is not a polite modal</strong>: if the app keeps
          working, do not block it.
        </p>
        <p>
          App-level notices — connection lost, a new build ready, a server contract the
          client no longer matches — are all banners by this rule. None of them blocks,
          and none of them ends on a timer. They belong to the shell rather than to a
          screen, so the shell owns where they sit; a screen that positions its own
          fixed banner will collide with the next one the app adds. In
          <code>u-sidebar-layout</code> that place is <code>slot="notice"</code>: put each
          notice there as an open <code>u-alert</code> and the shell stacks them at the top of
          the route content, full width, scrolling away with it rather than holding a strip
          of a small screen.
        </p>
      </u-group-box>

      <u-group-box level="2" title="Not yet decided">
        <p>
          Motion duration/easing values exist scattered across the codebase rather than
          standardized in one place.
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
