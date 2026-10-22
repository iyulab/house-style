import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { app } from '@iyulab/modern-app';
import type { UDialog } from '@iyulab/components';
import { at } from './base.js';
import { ALL_MENUS } from './nav.js';

/**
 * "Go to" — open a screen by its menu name, or find a record by ID or title. The libraries have no command
 * palette yet, so the app assembles one from a dialog, a searchable select and a search field.
 */
@customElement('rc-finder')
export class RcFinder extends LitElement {
  protected override createRenderRoot() { return this; }

  @query('u-dialog') private dialog?: UDialog;

  open() {
    this.dialog?.show();
  }

  private go(href: string) {
    this.dialog?.hide();
    app.navigate(href);
  }

  override render() {
    return html`
      <u-dialog>
        <span slot="header">Go to</span>
        <div class="rc-finder">
          <u-select label="Screen" searchable placeholder="Menu name"
            @change=${(e: Event) => { const v = (e.target as HTMLElement & { value?: string }).value; if (v) this.go(v); }}>
            ${ALL_MENUS.map((m) => html`<u-option value=${m.href}>${m.label} · ${m.group}</u-option>`)}
          </u-select>
          <u-input type="search" label="Find a record" placeholder="Record ID or title — Enter"
            @search=${(e: CustomEvent<{ query: string }>) => e.detail.query && this.go(at(`records?q=${encodeURIComponent(e.detail.query)}`))}>
            <u-icon slot="prefix" lib="lucide" name="search"></u-icon>
          </u-input>
        </div>
      </u-dialog>
    `;
  }
}
