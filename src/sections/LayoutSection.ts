import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';

/**
 * §2 Layout & viewport structure.
 *
 * Graded "partial" in the blueprint audit: the responsive machinery exists and is
 * running right now — this very page's sidebar is it — but no rule beyond that
 * machinery has been written down yet.
 */
@customElement('house-layout-section')
export class LayoutSection extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <u-page-header
        title="Layout & viewport"
        subtitle="The responsive sidebar shell is live, not a screenshot"
      ></u-page-header>

      <u-group-box title="Sidebar shell — live, not a screenshot">
        <p>
          The chrome around this page's content — the sidebar, its collapse behaviour,
          the scrolling main region — is the actual <code>SidebarLayout</code> from
          <code>@iyulab/modern-app</code>, not a picture of it. Resize this window to
          see it react.
        </p>
      </u-group-box>

      <u-group-box title="Breakpoints">
        <p>
          <code>ScreenObserver</code> tracks three sizes — <code>small</code>,
          <code>medium</code>, <code>large</code> — from a <code>ResizeObserver</code>
          on the app root, and dispatches a <code>screen-resize</code> window event on
          change. The default split is <code>[768, 1024]</code> pixels (below 768 is
          small, 768–1024 is medium, above 1024 is large) — an app can override it, but
          nothing on this page does.
        </p>
      </u-group-box>

      <u-group-box title="Not yet decided">
        <p>
          Beyond the breakpoint computation itself, there is no written rule yet for
          exactly which width converts the sidebar into a drawer, or a documented
          z-index layering convention for slide-over panels stacked above it.
        </p>
      </u-group-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-layout-section': LayoutSection;
  }
}
