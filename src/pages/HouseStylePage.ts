import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/components/dist/components/copy-button/UCopyButton.js';
import '../internals/DemoSource.js';
import { CATEGORIES, TIERS } from '../categories.js';
import { BOOT, CREATE, INDEX_HTML, INSTALL, STARTER } from '../start-here.js';
import listScreenSrc from '../sections/data-patterns/ListScreenDemo.ts?raw';
import listConstantsSrc from '../sections/data-patterns/constants.ts?raw';

const base = import.meta.env.BASE_URL;

/**
 * The landing page — the way in for someone about to build a screen: install, boot, build one
 * list screen, then where each kind of answer lives. How the guide came to be (the design audit
 * it grew out of) is at the bottom, not the top: it is not what a new reader asks first.
 */
@customElement('house-style-page')
export class HouseStylePage extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  private renderCode(code: string, label: string) {
    return html`
      <div class="start-code">
        <u-copy-button .value=${code} label=${label}></u-copy-button>
        <pre><code>${code}</code></pre>
      </div>
    `;
  }

  render() {
    return html`
      <u-page-header
        title="iyulab House Style"
        subtitle="How iyulab business screens look and behave — and the parts that build them"
      ></u-page-header>

      <u-group-box level="2" title="Start here">
        <ol class="start-steps">
          <li>
            <p><strong>Create the project</strong> — Vite with Lit and TypeScript. The template already sets the decorator options Lit components need.</p>
            ${this.renderCode(CREATE, 'Copy commands')}
          </li>
          <li>
            <p><strong>Install</strong> the components, the table, the app shell, and the house theme.</p>
            ${this.renderCode(INSTALL, 'Copy command')}
          </li>
          <li>
            <p>
              <strong>Load the house theme and start the app.</strong> Replace <code>index.html</code>, then write
              <code>src/main.ts</code>. The theme is one stylesheet in its own cascade layer — every component
              on this site reads its tokens, so importing it is what makes a screen look like this one, and any
              rule your app writes still wins over it.
            </p>
            ${this.renderCode(INDEX_HTML, 'Copy index.html')}
            ${this.renderCode(BOOT, 'Copy main.ts')}
          </li>
          <li>
            <p>
              <strong>Build your first screen</strong> from a working one — copy both files of the recipe below into
              <code>src/</code>, then run <code>npm run dev</code>.
            </p>
          </li>
        </ol>
        <p class="start-shortcut">
          Or take the finished result of these four steps — the same files, built and opened in a browser
          before every deploy of this guide:
        </p>
        ${this.renderCode(STARTER, 'Copy commands')}
      </u-group-box>

      <u-group-box level="2" title="Recipe: a list screen">
        <a slot="actions" href="${base}data-patterns">See it running →</a>
        <p>
          Most business apps start with a list: a table with a filter row and actions on the
          selected rows. This is the one the Data patterns page runs live — copy both files whole, then
          replace the columns and the data. The "no data yet" and "no matches" states that go
          with it are on the same page.
        </p>
        <ol class="start-recipe">
          <li><strong>Table</strong> — <code>u-rich-table</code> with columns, a filter row and row selection switched on; status renders as <code>u-tag</code> through the column's <code>render</code>.</li>
          <li><strong>Filtering</strong> — the list is already loaded, so <code>data-mode="client"</code> lets the table filter, sort and page it itself. When the query belongs to the server, leave the default and answer <code>filter-change</code> with a request.</li>
          <li><strong>Bulk actions</strong> — in the <code>bulk-actions</code> slot, shown only while rows are selected, with how many.</li>
          <li><strong>On a route</strong> — put a <code>u-page-header</code> above it to name the screen; the shell already gives the content area its gutter.</li>
        </ol>
        <house-demo-source label="ListScreenDemo.ts" .source=${listScreenSrc}></house-demo-source>
        <house-demo-source label="constants.ts" .source=${listConstantsSrc}></house-demo-source>
      </u-group-box>

      <u-group-box level="2" title="Where to find what">
        <div class="start-tiers">
          ${TIERS.map(tier => html`
            <section class="start-tier">
              <h3>${tier}</h3>
              <ul>
                ${CATEGORIES.filter(c => c.tier === tier).map(c => html`
                  <li><a href="${base}${c.path}">${c.label}</a><span>${c.summary}</span></li>
                `)}
                ${tier === 'Screens' ? html`
                  <li><a href="${base}app/">Reference app</a><span>A small complete app — sign in, browse and cancel orders, a multi-step wizard — built the way your app would be.</span></li>
                ` : ''}
              </ul>
            </section>
          `)}
        </div>
      </u-group-box>

      <u-group-box level="2" title="Using these components from React">
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

      <u-group-box level="2" title="About this guide">
        <p>
          This guide grew out of a design audit that graded seven categories. Where a decision
          exists it is shown live — generated from the tokens and components loaded on this
          site, so the guide cannot drift from its own source. Where the code decides something
          without a written rule, the page describes what the code does today. Where nothing is
          decided yet, the page says so under "Not yet decided" rather than inventing an answer.
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
