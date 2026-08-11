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
          There is no documented criterion yet for when an edit action should open a
          modal, a slide-over panel, or a dedicated page. Draft-save (persisting a
          partially filled form across sessions) is also still out of scope — no
          measured demand for it exists yet.
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
