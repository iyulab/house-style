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

      <u-group-box title="Using these components from React">
        <p>
          Everything on this site is a Lit web component, but it doesn't have to stay
          that way for consumers — <code>@iyulab/components</code>,
          <code>@iyulab/data-components</code>, and <code>@iyulab/u-widgets</code> each
          ship a <code>/react</code> subpath (built on <code>@lit/react</code>'s
          <code>createComponent</code>) that wraps every component as a typed React
          component: JSX props instead of attribute strings, <code>onXxx</code> handlers
          instead of manual <code>addEventListener</code>, no hand-rolled
          <code>customElements.whenDefined</code> race to work around.
        </p>
        <pre><code>import { UButton, UInput } from '@iyulab/components/react';

function Form() {
  return &lt;UButton color="primary" onClick={submit}&gt;Save&lt;/UButton&gt;;
}</code></pre>
        <p>
          <code>@lit/react</code> and <code>react</code> are peer dependencies — install
          them alongside whichever package's <code>/react</code> subpath you import.
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
