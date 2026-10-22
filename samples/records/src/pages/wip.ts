import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { app } from '@iyulab/modern-app';
import { at } from '../base.js';

/** A menu item this sample doesn't build — instead of a link that does nothing, a screen that says what is missing. */
@customElement('rc-wip')
export class RcWip extends LitElement {
  protected override createRenderRoot() { return this; }

  @property({ type: String }) name = '';

  override render() {
    return html`
      <div class="hs-page rc-page">
        <u-page-header title=${this.name || 'Not in this sample'}></u-page-header>
        <u-card>
          <u-empty-state variant="not-found" title="This screen is not in the sample"
            description="The sample builds four screens: Today, Find records, Request checkout and Storage map.">
            <u-button slot="actions" appearance="outlined" @click=${() => app.navigate(at())}>Back to Today</u-button>
          </u-empty-state>
        </u-card>
      </div>
    `;
  }
}
