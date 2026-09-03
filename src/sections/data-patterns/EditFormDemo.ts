import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/components/dist/components/date-picker/UDatePicker.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/components/dist/components/badge/UBadge.js';
import '@iyulab/components/dist/components/drawer/UDrawer.js';
import '@iyulab/components/dist/components/input/UInput.js';
import '@iyulab/components/dist/components/select/USelect.js';
import '@iyulab/components/dist/components/option/UOption.js';
import '@iyulab/components/dist/components/field/UField.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import type { UDrawer } from '@iyulab/components/dist/components/drawer/UDrawer.js';
import type { USelect } from '@iyulab/components/dist/components/select/USelect.js';

/** A server-shaped error — has a message worth showing the user as-is. */
interface ApiError { code: string; message: string; }

function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'code' in value && 'message' in value;
}

/**
 * Edit form recipe. No purpose-built "edit-form kit" component exists — this is
 * `u-drawer` — its existing header/body/footer slots and imperative
 * `show()`/`hide()` — wrapped around the same `u-info-section` + `u-field` grid
 * composition a full-page edit screen already uses elsewhere in this framework, so
 * a field keeps the same column rhythm whether it sits on a page or inside a drawer.
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

  private openEditDrawer() {
    this.saveStatus = 'idle';
    this.saveError = null;
    this.querySelector<UDrawer>('#edit-drawer')?.show();
  }

  private closeEditDrawer() {
    this.querySelector<UDrawer>('#edit-drawer')?.hide();
  }

  /**
   * Stands in for a real API call. `'api-error'` rejects with a server-shaped error
   * (has a `message` worth showing as-is); `'network-error'` rejects with a raw
   * `TypeError`, the same shape a failed `fetch()` throws — never something to show a
   * user directly.
   */
  private simulateSaveRequest(scenario: typeof this.saveScenario): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (scenario === 'api-error') {
          reject({ code: 'VALIDATION_ERROR', message: 'Delivery date must be after the order date.' } satisfies ApiError);
        } else if (scenario === 'network-error') {
          reject(new TypeError('Failed to fetch'));
        } else {
          resolve();
        }
      }, 10);
    });
  }

  private async handleSave() {
    this.saveStatus = 'saving';
    this.saveError = null;
    try {
      await this.simulateSaveRequest(this.saveScenario);
      this.closeEditDrawer();
    } catch (err) {
      this.saveStatus = 'error';
      this.saveError = isApiError(err) ? err.message : 'Something went wrong. Please try again.';
      return;
    }
    this.saveStatus = 'idle';
  }

  render() {
    return html`
      <u-button color="primary" @click=${this.openEditDrawer}>Edit order</u-button>
      <u-drawer id="edit-drawer" placement="right" closable>
        <span slot="header">Edit order G-2026-0512</span>
        <u-info-section min="200">
          <u-field label="Customer" required>
            <u-input value="Aster Trading"></u-input>
          </u-field>
          <u-field label="Status">
            <u-select value="pending">
              <u-option value="pending">Pending</u-option>
              <u-option value="shipped">Shipped</u-option>
              <u-option value="delivered">Delivered</u-option>
            </u-select>
          </u-field>
          <u-field label="Delivery date">
            <u-date-picker value="2026-03-31" clearable></u-date-picker>
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
        ${this.saveStatus === 'error'
          ? html`<u-badge color="danger">${this.saveError}</u-badge>`
          : ''}
        <div slot="footer">
          <u-button variant="ghost" @click=${this.closeEditDrawer}>Cancel</u-button>
          <u-button color="primary" ?disabled=${this.saveStatus === 'saving'} @click=${this.handleSave}>
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
