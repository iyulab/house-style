import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@iyulab/modern-app/dist/components/PageHeader.js';
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
      <u-page-header
        title="Visual identity & tokens"
        subtitle="Type scale, radius, and elevation — read live from the tokens loaded on this page"
      ></u-page-header>

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

        <u-group-box title="Korean (CJK) text — width is what decides line count">
          <p>
            The type scale above is demonstrated with <code>Aa 가나 123</code> for a reason: this
            stack ships Korean products. Three rules come out of measuring it, and the first one
            replaces the habit most people arrive with.
          </p>
          <p>
            <strong>Do not reach for <code>word-break: keep-all</code>.</strong> It is the usual
            advice for Korean UI and it does not help here. Measured inside a component's shadow
            root: a compound label like <code>대출종류코드</code> has no word boundary to keep, so
            the rule changes nothing at 40px, 60px or 90px; and a spaced label like
            <code>주문 번호 상태</code> in a 60px cell gets <em>taller</em> with it — 48px becomes
            72px, because refusing to split words costs a line in a narrow box.
          </p>
          <p>
            <strong>What actually decides the line count is the width.</strong> The same label, the
            same rules, width alone: 24px → 6 lines, 40px → 3, 60px → 2, <strong>90px → 1</strong>.
            A header rendering as <code>B / O / X / 번 / 호</code> is a column squeezed to one
            character, not a line-breaking problem. Declare table column widths and let the row area
            scroll sideways; on narrow screens drop columns rather than compress them.
          </p>
          <p>
            <strong>Leave <code>overflow-wrap: anywhere</code> on.</strong> Every component inherits
            it, and for Korean compounds it makes no practical difference — what it does earn is
            keeping a long identifier or URL from bursting its cell.
          </p>
          <p>
            <strong>Two typographic rules Korean inverts:</strong> no <code>text-transform:
            uppercase</code> — Korean has no uppercase, so it does nothing except enlarge any Latin
            mixed into the same string — and no positive <code>letter-spacing</code>, which reduces
            Hangul legibility rather than improving it. Build hierarchy from size, weight and colour
            instead; the <code>overline</code> stage is the one place a positive tracking belongs,
            and it assumes Latin.
          </p>
          <p>
            <strong>Two-character button labels need nothing.</strong> A common workaround is padding
            <code>검색</code> out with spaces; don't — a screen reader reads the gaps. Measured on
            <code>u-button</code>: <code>검색</code> is 56px and <code>초기화</code> 69px, against
            <code>OK</code> at 50px and <code>Search</code> at 68px. The control's padding already
            gives short Korean labels a sensible minimum.
          </p>
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

        <u-group-box title="Icons — pick one set and name it">
          <p>
            Which icon set is a brand decision and is still open (below). That does not leave
            consumers without a rule, because the failure it causes is silent: pass a name
            <code>u-icon</code> cannot resolve and it draws the fallback shape — no error, no
            warning. Thirty menu entries can render as the same glyph and nothing says so.
          </p>
          <p>
            So: <strong>choose one set, pass <code>lib</code> explicitly, and do not mix sets.</strong>
            This guide's own shell does exactly that (<code>lib="bootstrap"</code>). Naming the
            library is what turns an unresolved icon into a visible mistake instead of a uniform
            one, and it is worth doing before the brand decision rather than after it.
          </p>
        </u-group-box>

        <u-group-box title="Not yet decided">
          <p>
            A dedicated illustration/icon-set policy is on hold pending a brand
            decision — it is intentionally out of scope here rather than improvised.
            The operational rule above (one set, named explicitly) stands regardless of
            which set is eventually chosen.
          </p>
        </u-group-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-identity-section': IdentitySection;
  }
}
