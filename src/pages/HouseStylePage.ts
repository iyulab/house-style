import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';

/**
 * The landing page — an introduction to how this site is graded. The seven
 * categories used to be stacked below this page's scroll; they now live at
 * their own routes (see main.ts) and are reached through the sidebar.
 */
@customElement('house-style-page')
export class HouseStylePage extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <u-page-header
        title="iyulab House Style"
        subtitle="What is decided, cited live from source — and what is not, said plainly"
      ></u-page-header>

      <u-group-box title="How to read this page">
        <p>
          Seven categories, graded the same way the design audit behind this site graded
          them: some are shown live, generated from the actual tokens and components
          currently loaded on this site, so this site cannot drift out of sync with its
          own source. Others are described from what the code does today. A few are
          named as open questions rather than answered — this page does not invent a
          design decision just to fill a section.
        </p>
      </u-group-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-style-page': HouseStylePage;
  }
}
