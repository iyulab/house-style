import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/modern-app/dist/components/GroupBox.js';
import '@iyulab/modern-app/dist/components/InfoSection.js';
import '@iyulab/modern-app/dist/components/InfoField.js';

import { readToken, typographyRows } from '../internals/readToken.js';

const TYPE_STAGES = ['display', 'title', 'subtitle', 'body', 'label', 'caption', 'overline'] as const;
const RADIUS_STEPS = ['sm', 'md', 'lg', 'xl'] as const;
const SHADOW_STEPS = ['sm', 'md', 'lg', 'xl'] as const;
const SHADOW_COLOR_STEPS = ['weaker', 'weak', 'normal', 'strong', 'stronger'] as const;

/**
 * §1 Visual identity & tokens.
 *
 * This section IS the wiring. The blueprint's headline finding was that
 * `@iyulab/enterprise/styles/preset.css` defines a real house type scale, radius
 * ladder and elevation system, but nothing loaded it anywhere — this page loads it
 * (see `main.ts`), and every value shown below is read live from the document via
 * `getComputedStyle`, never retyped, so it can never drift from that source file.
 */
@customElement('house-identity-section')
export class IdentitySection extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @state() private tick = 0;
  private observer?: MutationObserver;
  private readonly onPresetReady = () => (this.tick += 1);

  connectedCallback() {
    super.connectedCallback();
    // Elevation tokens redeclare per theme (`:root[theme='dark']` in preset.css); the
    // typography and radius tokens do not. Re-rendering on theme change keeps every
    // reading below honest about which axes actually move and which don't.
    this.observer = new MutationObserver(() => (this.tick += 1));
    this.observer.observe(document.documentElement, { attributes: true, attributeFilter: ['theme'] });
    // The first render happens before `main.ts` finishes loading the house-style
    // preset (see its comment on load order) — re-render once it lands so this
    // table doesn't stay frozen on the pre-preset values it initially read.
    window.addEventListener('house-style:preset-ready', this.onPresetReady);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    window.removeEventListener('house-style:preset-ready', this.onPresetReady);
  }

  render() {
    void this.tick; // forces the readToken() calls below to re-evaluate on theme change
    return html`
      <section id="identity">
        <u-group-box title="Type scale">
          <p>
            Seven stages, each carrying size, weight, line-height and letter-tracking.
          </p>
          <u-info-section min="180">
            ${typographyRows(TYPE_STAGES).map(row => html`
              <u-info-field label=${row.label}>
                <div style="font-size: var(--u-text-${row.label}-size);
                            font-weight: var(--u-text-${row.label}-weight);
                            line-height: var(--u-text-${row.label}-leading);
                            letter-spacing: var(--u-text-${row.label}-tracking);">Aa 가나 123</div>
                <div>
                  ${row.properties.map(p => html`<code>${p.suffix}: ${readToken(p.token) || '—'}</code> `)}
                </div>
              </u-info-field>
            `)}
          </u-info-section>
        </u-group-box>

        <u-group-box title="Radius">
          <p>
            The control-level radius ladder is one notch rounder than the neutral
            default — the blueprint's own finding was that sharp corners contribute more
            to a "dated" impression on dense LOB screens than almost any other axis.
          </p>
          <u-info-section min="140">
            ${RADIUS_STEPS.map(step => html`
              <u-info-field label=${step}>
                <div style="width: 56px; height: 56px; border-radius: var(--u-radius-${step});
                            border: 1px solid var(--u-border-color); background: var(--u-bg-color-raised);"></div>
                <code>${readToken(`--u-radius-${step}`) || '—'}</code>
              </u-info-field>
            `)}
          </u-info-section>
        </u-group-box>

        <u-group-box title="Elevation">
          <p>
            Shadows use a blue-black tint rather than pure black. Elevation is the one
            axis in this preset that is redefined per theme — dark mode leans on
            brightness difference between surfaces more than shadow alone, so the values
            below actually change when you toggle the theme; type scale and radius do not.
          </p>
          <u-info-section min="140">
            ${SHADOW_STEPS.map(step => html`
              <u-info-field label=${step}>
                <div style="width: 56px; height: 56px; border-radius: var(--u-radius-md);
                            background: var(--u-bg-color-raised); box-shadow: var(--u-shadow-${step});"></div>
              </u-info-field>
            `)}
          </u-info-section>
          <u-info-section min="140">
            ${SHADOW_COLOR_STEPS.map(step => html`
              <u-info-field label=${step}><code>${readToken(`--u-shadow-color-${step}`) || '—'}</code></u-info-field>
            `)}
          </u-info-section>
        </u-group-box>

        <u-group-box title="Not yet decided">
          <p>
            A dedicated illustration/icon-set policy is on hold pending a brand
            decision — it is intentionally out of scope here rather than improvised.
          </p>
        </u-group-box>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-identity-section': IdentitySection;
  }
}
