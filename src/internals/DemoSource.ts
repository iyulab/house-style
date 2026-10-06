import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@iyulab/components/dist/components/copy-button/UCopyButton.js';

/**
 * «Show code» under a live demo — the demo's own source file, imported with Vite's `?raw`.
 *
 * The example and the thing it demonstrates are the same file, so the code shown here cannot
 * drift from what runs above it: that is the guide's "cite, don't duplicate" rule applied to code.
 * Collapsed by default so the page still reads as a guide, not a source listing.
 */
@customElement('house-demo-source')
export class DemoSource extends LitElement {
  /** The file's text (`import src from './X.ts?raw'`). */
  @property({ attribute: false }) source = '';
  /** The file name shown in the summary. */
  @property() label = '';

  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <details class="demo-source">
        <summary>Show code<span class="demo-source__file">${this.label}</span></summary>
        <div class="demo-source__bar">
          <u-copy-button .value=${this.source} label="Copy code"></u-copy-button>
        </div>
        <pre tabindex="0"><code>${this.source}</code></pre>
      </details>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-demo-source': DemoSource;
  }
}
