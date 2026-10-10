import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/components/dist/components/date-picker/UDatePicker.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/components/dist/components/alert/UAlert.js';
import '@iyulab/components/dist/components/badge/UBadge.js';
import '@iyulab/components/dist/components/drawer/UDrawer.js';
import '@iyulab/components/dist/components/input/UInput.js';
import '@iyulab/components/dist/components/select/USelect.js';
import '@iyulab/components/dist/components/option/UOption.js';
import '@iyulab/components/dist/components/field/UField.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import { UFormControlElement } from '@iyulab/components/dist/components/UFormControlElement.js';
import { ApiError, applyFieldErrors } from '@iyulab/enterprise';
import type { UDrawer } from '@iyulab/components/dist/components/drawer/UDrawer.js';
import type { USelect } from '@iyulab/components/dist/components/select/USelect.js';

/**
 * One line of the error summary — the field's label, the control's own message, and the control to go back to.
 * A line the server could not tie to a field (no target, or no field of that name) has no control and no link.
 */
interface FieldError { label: string; message: string; control?: HTMLElement; }

/** The label the user sees for a control — its `u-field`'s, else its name. */
const labelOf = (control: Element): string =>
  control.closest('u-field')?.label ?? control.getAttribute('name') ?? '';

/**
 * Edit form recipe. No purpose-built "edit-form kit" component exists — this is
 * `u-drawer` — its existing header/body/footer slots and imperative
 * `show()`/`hide()` — wrapped around the same `u-info-section` + `u-field` grid
 * composition a full-page edit screen already uses elsewhere in this framework, so
 * a field keeps the same column rhythm whether it sits on a page or inside a drawer.
 *
 * While a save is in flight the form is locked: one `<fieldset disabled>` around the fields
 * (`display: contents` — it is a disable boundary, not a visual group, so the grid is unchanged),
 * and the footer actions disabled with the same flag. A field edited during the request would
 * otherwise be silently left out of what was saved. On an error the lock lifts and the message shows.
 *
 * Saving first validates every field, and stops there if any is invalid: each invalid field shows its own
 * message, and an error summary at the top lists them — a title, one link per field that moves focus to it,
 * the same words as the inline message — and takes focus, so the save button never fails silently and a
 * screen reader user hears what to fix (GOV.UK «Error summary» · WCAG 3.3.1). The fields sit in a
 * `<form novalidate>` whose submit button is the footer's Save (`type="submit" form="edit-form"` — the footer
 * sits outside the form): Enter in a field submits it too, and the browser's own bubble stays out of the way.
 * `required` on `u-field` is the constraint, not only the marker.
 *
 * A rejection that names fields (`ApiError.details` with a `target`) lands on those fields the same way:
 * `applyFieldErrors` from `@iyulab/enterprise` puts each message on the control whose `name` is the target —
 * it clears when the user edits that field — and the summary lists them, plus any detail it could not place.
 *
 * Saving also demonstrates a two-tier error split: a typed API error (a server-shaped
 * `{ code, message }`) shows its `message` as-is, because the server wrote it to be
 * read. Anything else — a raw `TypeError` from a failed `fetch`, or any other
 * exception shape — collapses to one generic sentence instead.
 */
@customElement('house-data-patterns-edit-form')
export class EditFormDemo extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @state() private saveScenario: 'ok' | 'api-error' | 'network-error' = 'ok';
  @state() private saveStatus: 'idle' | 'saving' | 'error' = 'idle';
  @state() private saveError: string | null = null;
  @state() private fieldErrors: FieldError[] = [];

  private get form(): HTMLFormElement {
    return this.querySelector<HTMLFormElement>('#edit-form')!;
  }

  private openEditDrawer() {
    this.saveStatus = 'idle';
    this.saveError = null;
    this.fieldErrors = [];
    this.querySelector<UDrawer>('#edit-drawer')?.show();
  }

  private closeEditDrawer() {
    this.querySelector<UDrawer>('#edit-drawer')?.hide();
  }

  /**
   * Stands in for a real API call. `'api-error'` rejects with an `ApiError` whose details name the
   * delivery date — the shape `createODataService` throws for an OData rejection; `'network-error'` rejects with a raw
   * `TypeError`, the same shape a failed `fetch()` throws — never something to show a
   * user directly.
   */
  private simulateSaveRequest(scenario: typeof this.saveScenario): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (scenario === 'api-error') {
          reject(new ApiError('The order could not be saved.', 400, {
            code: 'InvalidBody',
            details: [{ code: 'ValidationFailed', message: 'Must be after the order date (2026-03-02).', target: 'delivery' }],
          }));
        } else if (scenario === 'network-error') {
          reject(new TypeError('Failed to fetch'));
        } else {
          resolve();
        }
      }, 10);
    });
  }

  /**
   * Validates every control in the form — `validate()` on each shows its own message — and collects the
   * invalid ones for the summary. Every field is checked, not only the first, so one save shows every
   * problem at once.
   */
  private async validateFields(): Promise<boolean> {
    const invalid = Array.from(this.form.elements)
      .filter((el): el is UFormControlElement<unknown> => el instanceof UFormControlElement)
      .filter((control) => !control.validate());
    if (invalid.length === 0) return true;
    await this.showSummary(invalid.map((control) => ({ label: labelOf(control), message: control.validationMessage, control })));
    return false;
  }

  /** Says what to do — «field» when every line points at one, «problem» otherwise. */
  private get summaryTitle(): string {
    const n = this.fieldErrors.length;
    const noun = this.fieldErrors.every((e) => e.control) ? 'field' : 'problem';
    return `Fix ${n} ${noun}${n === 1 ? '' : 's'} to save`;
  }

  /** Shows the error summary and moves focus to it — a screen reader user hears the title and the list. */
  private async showSummary(errors: FieldError[]) {
    this.fieldErrors = errors;
    await this.updateComplete;
    this.querySelector<HTMLElement>('#edit-errors')?.focus();
  }

  private handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    void this.handleSave();
  };

  private async handleSave() {
    this.fieldErrors = [];
    if (!(await this.validateFields())) return;
    this.saveStatus = 'saving';
    this.saveError = null;
    try {
      await this.simulateSaveRequest(this.saveScenario);
      this.closeEditDrawer();
    } catch (err) {
      // Unlock first: a disabled control is barred from validation, so a message put on it would not show.
      this.saveStatus = 'idle';
      await this.updateComplete;
      const { applied, formLevel } = applyFieldErrors(this.form, err);
      if (applied.length + formLevel.length > 0) {
        await this.showSummary([
          ...applied.map((a) => ({ label: labelOf(a.control), message: a.message, control: a.control })),
          ...formLevel.map((d) => ({ label: '', message: d.message })),
        ]);
        return;
      }
      this.saveStatus = 'error';
      this.saveError = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      return;
    }
    this.saveStatus = 'idle';
  }

  render() {
    return html`
      <u-button color="primary" @click=${this.openEditDrawer}>Edit order</u-button>
      <u-drawer id="edit-drawer" placement="right" closable>
        <span slot="header">Edit order G-2026-0512</span>
        ${this.fieldErrors.length
          ? html`
            <u-alert id="edit-errors" open status="error" tabindex="-1" style="margin-block-end: var(--u-space-lg)"
              title=${this.summaryTitle}>
              <ul style="margin: 0; padding-inline-start: 1.25em">
                ${this.fieldErrors.map((error) => html`
                  <li>${error.control
                    ? html`<a href="#" @click=${(e: Event) => { e.preventDefault(); error.control?.focus(); }}>${error.label}: ${error.message}</a>`
                    : error.message}</li>
                `)}
              </ul>
            </u-alert>`
          : ''}
        <form id="edit-form" novalidate @submit=${this.handleSubmit} style="display: contents">
        <fieldset ?disabled=${this.saveStatus === 'saving'} style="display: contents">
        <u-info-section min="200">
          <u-field label="Customer" required>
            <u-input name="customer" value="Aster Trading"></u-input>
          </u-field>
          <u-field label="Status">
            <u-select name="status" value="pending">
              <u-option value="pending">Pending</u-option>
              <u-option value="shipped">Shipped</u-option>
              <u-option value="delivered">Delivered</u-option>
            </u-select>
          </u-field>
          <u-field label="Delivery date" required description="Clear it and save to see the summary">
            <u-date-picker name="delivery" value="2026-03-31" clearable></u-date-picker>
          </u-field>
          <u-field label="Total" description="Read-only — set from the order's items">
            <u-input value="₩1,080,000" disabled></u-input>
          </u-field>
          <u-field label="Simulate save result" description="Demo control — not part of the recipe">
            <u-select
              .value=${this.saveScenario}
              @change=${(e: Event) => {
                const value = (e.target as USelect).value;
                this.saveScenario = (Array.isArray(value) ? value[0] : value) as typeof this.saveScenario;
              }}
            >
              <u-option value="ok">Success</u-option>
              <u-option value="api-error">API validation error</u-option>
              <u-option value="network-error">Network error</u-option>
            </u-select>
          </u-field>
        </u-info-section>
        </fieldset>
        </form>
        ${this.saveStatus === 'error'
          ? html`<u-badge color="danger">${this.saveError}</u-badge>`
          : ''}
        <div slot="footer">
          <u-button appearance="plain" ?disabled=${this.saveStatus === 'saving'} @click=${this.closeEditDrawer}>Cancel</u-button>
          <u-button type="submit" form="edit-form" color="primary" ?disabled=${this.saveStatus === 'saving'}>
            ${this.saveStatus === 'saving' ? 'Saving…' : 'Save'}
          </u-button>
        </div>
      </u-drawer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-data-patterns-edit-form': EditFormDemo;
  }
}
