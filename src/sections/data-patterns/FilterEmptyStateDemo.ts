import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/components/dist/components/input/UInput.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/modern-app/dist/components/EmptyState.js';
import type { UInput } from '@iyulab/components/dist/components/input/UInput.js';

const FILTER_ITEMS = ['Aster Trading', 'Blue Harbor Co.', 'Cedar & Finch'];

/**
 * A live filter over a small independent list — not the list-screen table, so this
 * recipe stays legible on its own.
 */
@customElement('house-data-patterns-filter-empty-state')
export class FilterEmptyStateDemo extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @state() private filterText = '';

  render() {
    const matches = FILTER_ITEMS.filter(name =>
      name.toLowerCase().includes(this.filterText.toLowerCase()));
    return html`
      <u-input
        placeholder="Filter customers…"
        clearable
        .value=${this.filterText}
        @input=${(e: Event) => { this.filterText = (e.target as UInput).value ?? ''; }}
        @change=${(e: Event) => { this.filterText = (e.target as UInput).value ?? ''; }}
      ></u-input>
      ${matches.length > 0
        ? html`<ul>${matches.map(name => html`<li>${name}</li>`)}</ul>`
        : html`
          <u-empty-state variant="no-results">
            <span slot="actions">
              <u-button size="sm" variant="outlined" @click=${() => { this.filterText = ''; }}>
                Clear filter
              </u-button>
            </span>
          </u-empty-state>
        `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-data-patterns-filter-empty-state': FilterEmptyStateDemo;
  }
}
