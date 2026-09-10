import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/components/dist/components/input/UInput.js';
import '@iyulab/components/dist/components/select/USelect.js';
import '@iyulab/components/dist/components/option/UOption.js';
import '@iyulab/components/dist/components/field/UField.js';
import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import '@iyulab/modern-app/dist/components/InfoField.js';
import '@iyulab/modern-app/dist/components/MasterDetailLayout.js';
import '@iyulab/modern-app/dist/components/Wizard.js';
import type { WizardStep, WizardStepChangeDetail } from '@iyulab/modern-app/dist/components/Wizard.js';
import type { Wizard } from '@iyulab/modern-app/dist/components/Wizard.js';
import type { UInput } from '@iyulab/components/dist/components/input/UInput.js';
import type { USelect } from '@iyulab/components/dist/components/select/USelect.js';

/**
 * §5 User flows (CRUD / Wizard / Bulk).
 *
 * The wizard sub-section used to say "no measured demand" — that judgment predated
 * `u-wizard` shipping and is now stale. Onboarding/setup/checkout flows are common
 * enough across unrelated products that the case for building it didn't need to wait
 * on a specific consumer asking first.
 */
@customElement('house-flows-section')
export class FlowsSection extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @state() private pickedTask: string | null = null;
  @state() private alwaysOverlay = false;

  @state() private wizardActive = 0;
  @state() private wizardName = '';
  @state() private wizardNotifyBy = 'email';
  @state() private wizardError = '';
  @state() private wizardDone = false;

  private get wizardSteps(): WizardStep[] {
    return [
      { id: 'profile', label: 'Profile', state: this.wizardError ? 'error' : this.wizardActive > 0 ? 'done' : undefined },
      { id: 'preferences', label: 'Preferences', state: this.wizardActive > 1 ? 'done' : undefined },
      { id: 'review', label: 'Review' },
    ];
  }

  /**
   * `step-change` is cancelable — this is where validation lives, not inside the
   * component. Going from step 0 forward requires a name; going backward is never
   * blocked (there's nothing to validate about revisiting a step).
   */
  private handleWizardStepChange(e: CustomEvent<WizardStepChangeDetail>) {
    const { from, to } = e.detail;
    if (from === 0 && to > from && this.wizardName.trim() === '') {
      e.preventDefault();
      this.wizardError = 'Enter a name before continuing.';
      return;
    }
    this.wizardError = '';
    this.wizardActive = to;
  }

  private handleWizardBack() {
    this.querySelector<Wizard>('#setup-wizard')?.back();
  }

  private handleWizardFinish() {
    this.wizardDone = true;
  }

  /**
   * The list stays mounted while the detail opens and closes — that is the whole
   * point of the container, and the reason selection lives out here rather than
   * inside the layout. `u-master-detail-layout` renders whatever is in the `detail`
   * slot and disappears when that slot empties; deciding *what* is selected is the
   * consumer's job.
   */
  private static readonly TASKS = [
    { id: 'T-1041', title: 'Rotate signing key', owner: 'Platform', status: 'In review' },
    { id: 'T-1042', title: 'Backfill audit log', owner: 'Data', status: 'Blocked' },
    { id: 'T-1043', title: 'Retire legacy export', owner: 'Platform', status: 'Open' },
    { id: 'T-1044', title: 'Split billing job', owner: 'Billing', status: 'Open' },
  ];

  private get pickedTaskRecord() {
    return FlowsSection.TASKS.find(t => t.id === this.pickedTask);
  }

  private resetWizard() {
    this.wizardActive = 0;
    this.wizardName = '';
    this.wizardNotifyBy = 'email';
    this.wizardError = '';
    this.wizardDone = false;
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
          not the flow itself. See the list-screen recipe in Data patterns for it wired
          into a real bulk-action bar.
        </p>
      </u-group-box>

      <u-group-box title="List to detail — choosing the container">
        <p>
          Three containers can hold the detail of a row the user just picked, and the
          choice is not a matter of taste. The deciding question is
          <strong>whether the user comes back to the list, repeatedly, in one sitting</strong>.
        </p>
        <table>
          <thead>
            <tr><th>The user is</th><th>Container</th><th>Why</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>making one short decision and returning &mdash; confirm, rename, reassign</td>
              <td><code>u-dialog</code></td>
              <td>It blocks the page on purpose. Work that outlasts the decision itself does not belong behind a blocker.</td>
            </tr>
            <tr>
              <td>working through rows in sequence, where the list's filters, scroll position and side-by-side comparison still matter</td>
              <td><code>u-master-detail-layout</code></td>
              <td>The list never unmounts, so coming back to it costs nothing &mdash; no refetch, no lost scroll, no re-applied filter.</td>
            </tr>
            <tr>
              <td>arriving at one item as a destination &mdash; linked from elsewhere, bookmarked, with sub-navigation or real depth of its own</td>
              <td>a route page</td>
              <td>The URL is the feature. If nobody would ever paste that link, this is the wrong choice.</td>
            </tr>
          </tbody>
        </table>
        <p>
          The costly mistake is the second row handled as the third: a queue worked
          front to back, where every item is a full navigation and every return re-runs
          the query the user already paid for.
        </p>
        <p>
          <strong>What this guide's own reference app does.</strong> Its order list opens
          a route page, and that is the third row rather than a contradiction &mdash; an
          order carries depth of its own (status history, line items, an edit panel) and
          is linked to from outside the list. A queue whose rows are read and dismissed
          one after another would use the master/detail container below instead.
        </p>
      </u-group-box>

      <u-group-box title="Master/detail — split, and overlay on narrow widths">
        <p>
          The default slot is the master pane and <code>slot="detail"</code> is the
          detail pane. Detail appears when that slot is filled and disappears when it
          empties &mdash; the component never decides what is selected, so selection
          state lives in the screen around it. Below
          <code>overlayBreakpoint</code> the detail covers the master and gains a close
          button that fires <code>detail-close</code>.
        </p>
        <u-field label="Layout">
          <u-select
            .value=${this.alwaysOverlay ? 'overlay' : 'split'}
            @change=${(e: Event) => {
              const value = (e.target as USelect).value;
              const next = Array.isArray(value) ? (value[0] ?? 'split') : (value ?? 'split');
              this.alwaysOverlay = next === 'overlay';
            }}
          >
            <u-option value="split">Split when there is room</u-option>
            <u-option value="overlay">Always overlay</u-option>
          </u-select>
        </u-field>
        <u-master-detail-layout
          style="height: 18rem"
          master-size="14rem"
          .overlayBreakpoint=${this.alwaysOverlay ? Number.MAX_SAFE_INTEGER : 640}
          @detail-close=${() => { this.pickedTask = null; }}
        >
          <div>
            ${FlowsSection.TASKS.map(task => html`
              <u-button
                variant=${this.pickedTask === task.id ? 'filled' : 'ghost'}
                style="display: block; width: 100%"
                @click=${() => { this.pickedTask = task.id; }}
              >${task.id} &mdash; ${task.title}</u-button>
            `)}
          </div>
          ${this.pickedTaskRecord
            ? html`
              <div slot="detail">
                <u-info-section min="160">
                  <u-info-field label="Task" .value=${this.pickedTaskRecord.id}></u-info-field>
                  <u-info-field label="Title" .value=${this.pickedTaskRecord.title}></u-info-field>
                  <u-info-field label="Owner" .value=${this.pickedTaskRecord.owner}></u-info-field>
                  <u-info-field label="Status" .value=${this.pickedTaskRecord.status}></u-info-field>
                </u-info-section>
              </div>
            `
            : ''}
        </u-master-detail-layout>
        <p>
          <strong><code>overlayBreakpoint</code> is a structural prop, not a design
          breakpoint.</strong> It is compared against the component's <em>own</em> width,
          not the viewport, so two instances on one screen can legitimately switch at
          different sizes &mdash; which is also why it cannot be a CSS media query. To
          overlay at every width, set it above any width the component will ever have;
          that is a supported use of the prop rather than a way around it. The default,
          760, assumes a master pane plus a detail pane wide enough to read.
        </p>
        <p>
          <strong>Selection is not reflected in the URL yet.</strong> Opening and closing
          the detail leaves the address bar untouched, so a refresh or a shared link
          loses the selection, and Back does not close the panel. Putting selection in
          the query string is the natural next step, but it currently re-mounts the whole
          screen on every change &mdash; the router recreates a route's content whenever
          the URL changes at all, including a query-only change, which would throw away
          exactly the list state this container exists to preserve. Until that is
          addressed upstream, keep selection in component state, as above.
        </p>
      </u-group-box>

      <u-group-box title="Wizard — multi-step setup flow">
        <p>
          <code>u-wizard</code> owns the step indicator, the active panel, and Back/Next
          navigation — it does not own validation or persistence. <code>active</code> is
          a controlled prop, and advancing fires a cancelable <code>step-change</code>
          event; this demo blocks leaving the first step until a name is entered by
          calling <code>event.preventDefault()</code> in that handler, exactly where the
          component's own contract says validation belongs.
        </p>
        ${this.wizardDone
          ? html`
            <u-info-section min="160">
              <u-info-field label="Name" .value=${this.wizardName}></u-info-field>
              <u-info-field label="Notify by" .value=${this.wizardNotifyBy}></u-info-field>
            </u-info-section>
            <p>Setup complete.</p>
            <u-button variant="outlined" @click=${this.resetWizard}>Start over</u-button>
          `
          : html`
            <u-wizard
              id="setup-wizard"
              style="height: 20rem"
              .steps=${this.wizardSteps}
              .active=${this.wizardActive}
              @step-change=${this.handleWizardStepChange}
            >
              <div>
                <u-field label="Full name" required>
                  <u-input
                    .value=${this.wizardName}
                    @input=${(e: Event) => { this.wizardName = (e.target as UInput).value ?? ''; }}
                  ></u-input>
                </u-field>
                ${this.wizardError ? html`<p>${this.wizardError}</p>` : ''}
              </div>
              <div>
                <u-field label="Notify me by">
                  <u-select
                    .value=${this.wizardNotifyBy}
                    @change=${(e: Event) => {
                      const value = (e.target as USelect).value;
                      this.wizardNotifyBy = Array.isArray(value) ? (value[0] ?? 'email') : (value ?? 'email');
                    }}
                  >
                    <u-option value="email">Email</u-option>
                    <u-option value="sms">SMS</u-option>
                    <u-option value="none">Don't notify me</u-option>
                  </u-select>
                </u-field>
              </div>
              <div>
                <u-info-section min="160">
                  <u-info-field label="Name" .value=${this.wizardName}></u-info-field>
                  <u-info-field label="Notify by" .value=${this.wizardNotifyBy}></u-info-field>
                </u-info-section>
              </div>
              ${this.wizardActive === 2 ? html`
                <span slot="actions">
                  <u-button variant="ghost" @click=${this.handleWizardBack}>Back</u-button>
                  <u-button color="primary" @click=${this.handleWizardFinish}>Finish setup</u-button>
                </span>
              ` : ''}
            </u-wizard>
          `}
      </u-group-box>

      <u-group-box title="Not yet decided">
        <p>
          Draft-save — persisting a partially filled form across sessions — is still out
          of scope; no measured demand for it exists yet.
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
