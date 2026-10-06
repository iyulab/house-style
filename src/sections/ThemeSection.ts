import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/components/dist/components/input/UInput.js';
import '@iyulab/components/dist/components/select/USelect.js';
import '@iyulab/components/dist/components/option/UOption.js';
import '@iyulab/components/dist/components/tag/UTag.js';
import '@iyulab/components/dist/components/icon/UIcon.js';
import { readToken } from '../internals/readToken.js';

/**
 * Theme & layout patterns — how an application loads the house theme, brands it, and assembles a
 * screen from the `hs-*` patterns (`styles/patterns.css`). Every pattern below is the real class
 * an application uses, rendered by the same stylesheet the package ships.
 */
@customElement('house-theme-section')
export class ThemeSection extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @state() private selected = new Set<string>(['O-1042']);

  private readonly rows = [
    { id: 'O-1043', customer: 'Northwind Trading', status: ['Received', 'info'], due: 'D-27', dueTone: '', qty: 70, amount: 276375, tag: 'Proof' },
    { id: 'O-1042', customer: 'Contoso Ltd.', status: ['In production', 'warning'], due: 'D-5', dueTone: 'soon', qty: 100, amount: 1180000, tag: '' },
    { id: 'O-1041', customer: 'Fabrikam Inc.', status: ['Shipped', 'success'], due: '—', dueTone: '', qty: 500, amount: 5200000, tag: '' },
    { id: 'O-1040', customer: 'Adventure Works', status: ['On hold', 'danger'], due: 'D+3', dueTone: 'over', qty: 30, amount: 96000, tag: 'Reprint' },
  ] as const;

  private toggle(id: string) {
    const next = new Set(this.selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selected = next;
  }

  render() {
    const won = (n: number) => `₩${n.toLocaleString('en-US')}`;
    return html`
      <u-page-header
        title="Theme & layout patterns"
        subtitle="One import for the house look, three tokens for your brand, and the patterns a business screen repeats"
      ></u-page-header>

      <u-group-box level="2" title="Load the theme">
        <p>
          <code>@iyulab/house-style</code> is CSS only. Import it once; it sits in the
          <code>iyu.house</code> cascade layer above the components' built-in defaults
          (<code>iyu.base</code>) and below your own CSS, which is unlayered and therefore always wins —
          no specificity tricks, no load-order rules.
        </p>
        <pre tabindex="0"><code>// an app without Tailwind — from JS
import '@iyulab/house-style';                          // fonts + tokens + recipes + patterns

/* a Tailwind v4 app — from its Tailwind stylesheet, instead of the line above */
@import 'tailwindcss';
@import '@iyulab/house-style/styles/tailwind.css';     /* theme + bg-canvas, text-ink-weak … */</code></pre>
        <p>
          Tailwind declares its own layers after the house layers, so its preflight
          (<code>* { padding: 0 }</code>, <code>h1 { font-size: inherit }</code>) would beat the theme.
          The Tailwind entry imports the theme into Tailwind's <code>components</code> layer instead —
          above preflight, below utilities and your own CSS.
        </p>
        <table class="prose-table">
          <thead><tr><th>Layer</th><th>Holds</th></tr></thead>
          <tbody>
            <tr><td><em>(unlayered)</em></td><td>your application — always wins</td></tr>
            <tr><td><code>iyu.house</code></td><td>this theme: values, component recipes, <code>hs-*</code> patterns</td></tr>
            <tr><td><code>iyu.base</code></td><td><code>@iyulab/components</code> defaults — neutral, always present</td></tr>
          </tbody>
        </table>
      </u-group-box>

      <u-group-box level="2" title="Brand it — three tokens">
        <p>
          The house is neutral so an unbranded app looks finished. Your identity colour goes on the logo
          and the current navigation item only — never on buttons or warnings, where a red brand would
          read as "danger".
        </p>
        <div class="hs-grid-3">
          ${(['--hs-brand', '--hs-brand-soft', '--hs-brand-ink'] as const).map(name => html`
            <div class="hs-card">
              <div style="height:32px;border-radius:var(--u-radius-lg);background:var(${name});border:1px solid var(--u-border-color)"></div>
              <p class="hs-field__help"><code>${name}</code> — <code>${readToken(name)}</code></p>
            </div>`)}
        </div>
        <pre tabindex="0"><code>:root { --hs-brand: #c8161d; --hs-brand-soft: #fcebec; --hs-brand-ink: #a3121a; }
:root[theme="dark"] { --hs-brand-soft: #3a1a1c; --hs-brand-ink: #ff9a9e; }</code></pre>
      </u-group-box>

      <u-group-box level="2" title="List screen — head, views, filters, totals, table">
        <p>
          Conditions fold and results open: saved views and up to three key filters stay on screen, the
          rest go behind <em>Filters</em>, totals are cells rather than a sentence, and the table starts in
          the top third of the screen. One ink button per view.
        </p>
        <div class="hs-page" style="padding:var(--u-space-lg);background:var(--u-canvas-bg-color);border-radius:var(--u-radius-xl)">
          <div class="hs-page-head">
            <div>
              <p class="hs-page-head__eyebrow">Sales</p>
              <h3 class="hs-page-head__title">Orders</h3>
              <p class="hs-page-head__description">Select an order number to open its details on the right.</p>
            </div>
            <div class="hs-page-head__actions">
              <u-button appearance="outlined">Season 2027</u-button>
              <u-button appearance="outlined">Export</u-button>
              <u-button>New order</u-button>
            </div>
          </div>

          <div class="hs-views" role="tablist" aria-label="Saved views">
            <button class="hs-views__tab" role="tab" aria-selected="true">All <span class="hs-count">962</span></button>
            <button class="hs-views__tab" role="tab" aria-selected="false">Received today</button>
            <button class="hs-views__tab" role="tab" aria-selected="false">Due in 7 days</button>
            <button class="hs-views__tab" role="tab" aria-selected="false">Not invoiced</button>
          </div>

          <div class="hs-filter-bar">
            <u-input class="hs-filter-bar__search" placeholder="Order, customer, product…" aria-label="Search orders"></u-input>
            <u-select value="all" aria-label="Channel"><u-option value="all">Channel: all</u-option></u-select>
            <u-select value="all" aria-label="Status"><u-option value="all">Status: all</u-option></u-select>
            <u-button appearance="outlined">Filters · 1</u-button>
            <u-button class="hs-filter-bar__end" appearance="plain">Save view</u-button>
          </div>

          <div class="hs-stats">
            <div class="hs-stat"><div class="hs-stat__label">Orders</div><div class="hs-stat__value">962<span class="hs-stat__unit">orders</span></div><div class="hs-stat__sub">1,764,211 units</div></div>
            <div class="hs-stat"><div class="hs-stat__label">Invoiced</div><div class="hs-stat__value">₩761,234,820</div><div class="hs-stat__sub">Settled ₩743,188,120</div></div>
            <div class="hs-stat hs-stat--warning"><div class="hs-stat__label">Due in 7 days</div><div class="hs-stat__value">14</div><div class="hs-stat__sub">3 not started</div></div>
            <div class="hs-stat hs-stat--danger"><div class="hs-stat__label">Overdue</div><div class="hs-stat__value">₩0</div><div class="hs-stat__sub">0 orders</div></div>
          </div>

          <div class="hs-table-card">
            <div class="hs-table-toolbar ${this.selected.size ? 'hs-table-toolbar--selected' : ''}">
              <span class="hs-table-toolbar__title">${this.selected.size ? `${this.selected.size} selected` : '4 orders'}</span>
              <div class="hs-page-head__actions">
                <u-button size="sm" appearance="outlined">Advance step</u-button>
                <u-button size="sm" appearance="outlined">Print</u-button>
              </div>
            </div>
            <table class="hs-table">
              <thead>
                <tr>
                  <th style="width:36px"><span class="guide-visually-hidden">Select</span></th><th>Order</th><th>Customer</th><th>Status</th><th>Due</th>
                  <th class="hs-num">Qty</th><th class="hs-num">Amount</th><th style="width:72px"><span class="guide-visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                ${this.rows.map(r => html`
                  <tr aria-selected=${this.selected.has(r.id) ? 'true' : 'false'}>
                    <td><input type="checkbox" .checked=${this.selected.has(r.id)} @change=${() => this.toggle(r.id)} aria-label="Select ${r.id}" /></td>
                    <td><a class="hs-id" href="#">${r.id}</a> ${r.tag ? html`<span class="hs-attr">${r.tag}</span>` : ''}</td>
                    <td>${r.customer}</td>
                    <td><u-tag dot color=${r.status[1]}>${r.status[0]}</u-tag></td>
                    <td>${r.due === '—' ? html`<span class="hs-empty">—</span>` : html`<span class="hs-due ${r.dueTone ? `hs-due--${r.dueTone}` : ''}">${r.due}</span>`}</td>
                    <td class="hs-num">${r.qty.toLocaleString('en-US')}</td>
                    <td class="hs-num">${won(r.amount)}</td>
                    <td class="hs-num"><span class="hs-row-actions">
                      <u-button size="sm" appearance="plain" aria-label="Edit ${r.id}"><u-icon lib="bootstrap" name="pencil"></u-icon></u-button>
                      <u-button size="sm" appearance="plain" aria-label="More for ${r.id}"><u-icon lib="bootstrap" name="three-dots"></u-icon></u-button>
                    </span></td>
                  </tr>`)}
              </tbody>
            </table>
            <div class="hs-pager"><span>1–4 / 962</span><span><u-button size="sm" appearance="outlined">Previous</u-button> <u-button size="sm" appearance="outlined">Next</u-button></span></div>
          </div>
        </div>
        <p>
          Row actions are in the DOM for keyboard and assistive technology and appear on hover, focus or
          selection — never a red trash can on every row; delete lives behind the row menu and a confirmation.
          The identifier is bold ink, not a blue link repeated hundreds of times. An empty value is an em dash.
        </p>
      </u-group-box>

      <u-group-box level="2" title="Callouts — the conclusion in the title">
        <div class="hs-page">
          <div class="hs-callout hs-callout--warning">
            <span class="hs-callout__icon"><u-icon lib="bootstrap" name="exclamation-triangle"></u-icon></span>
            <div><div class="hs-callout__title">Some customers need their due date checked</div><div class="hs-callout__body">Due dates are not computed for barter and offset accounts.</div></div>
            <div class="hs-callout__actions"><u-button size="sm" appearance="outlined">Show them</u-button></div>
          </div>
          <div class="hs-callout hs-callout--info">
            <span class="hs-callout__icon"><u-icon lib="bootstrap" name="info-circle"></u-icon></span>
            <div><div class="hs-callout__title">Totals follow the filters above</div><div class="hs-callout__body">Clear a filter chip to widen them.</div></div>
            <span></span>
          </div>
          <div class="hs-callout hs-callout--note">
            <span class="hs-callout__icon"><u-icon lib="bootstrap" name="pencil"></u-icon></span>
            <div><div class="hs-callout__title">Note</div><div class="hs-callout__body">Customer asked for the same cover as last year; only the logo changes.</div></div>
            <div class="hs-callout__actions"><u-button size="sm" appearance="plain">Edit</u-button></div>
          </div>
        </div>
        <p>
          One callout per screen. No thick coloured edge — an icon and a tint carry the tone. A person's
          note on a record is <code>--note</code>: it is not a warning.
        </p>
      </u-group-box>

      <u-group-box level="2" title="Edit form — sections and a pinned footer">
        <div class="hs-card" style="padding:0;max-width:560px">
          <div style="padding:var(--u-space-xl)">
            <fieldset class="hs-fieldset">
              <legend class="hs-fieldset__legend">Identity</legend>
              <div class="hs-grid-2">
                <label class="hs-field"><span class="hs-field__label">Order number<span class="hs-field__required">*</span></span><u-input value="O-1043"></u-input></label>
                <label class="hs-field"><span class="hs-field__label">Original number</span><u-input placeholder="None"></u-input></label>
              </div>
            </fieldset>
            <fieldset class="hs-fieldset">
              <legend class="hs-fieldset__legend">Schedule</legend>
              <div class="hs-grid-2">
                <label class="hs-field"><span class="hs-field__label">Order date</span><u-input value="2026-08-26"></u-input></label>
                <label class="hs-field"><span class="hs-field__label">Payment due</span><u-input value="2027-02-28"></u-input><span class="hs-field__help">From the channel rule · editable</span></label>
              </div>
            </fieldset>
          </div>
          <div class="hs-sheet-footer">
            <span class="hs-sheet-footer__summary">1 change · Order number</span>
            <span class="hs-sheet-footer__actions"><u-button appearance="outlined" size="lg">Cancel</u-button><u-button size="lg">Save</u-button></span>
          </div>
        </div>
        <p>
          Label above, help below, two or three columns — never four. Fields that are computed say where
          the value came from. Save stays disabled until something changes, and the footer names what did.
        </p>
      </u-group-box>
    `;
  }
}
