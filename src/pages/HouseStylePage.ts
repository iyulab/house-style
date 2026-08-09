import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';

import '../sections/IdentitySection.js';
import '../sections/LayoutSection.js';
import '../sections/DepthSection.js';
import '../sections/DataPatternsSection.js';
import '../sections/FlowsSection.js';
import '../sections/FeedbackSection.js';
import '../sections/VoiceA11ySection.js';

/**
 * The whole site is one page — the sidebar's nav buttons scroll to the sections
 * below rather than routing anywhere, so there is exactly one route to resolve
 * and nothing for a router to get wrong under a GitHub Pages subpath.
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
          currently loaded on this page, so this page cannot drift out of sync with its
          own source. Others are described from what the code does today. A few are
          named as open questions rather than answered — this page does not invent a
          design decision just to fill a section.
        </p>
      </u-group-box>

      <house-identity-section></house-identity-section>
      <house-layout-section></house-layout-section>
      <house-depth-section></house-depth-section>
      <house-data-patterns-section></house-data-patterns-section>
      <house-flows-section></house-flows-section>
      <house-feedback-section></house-feedback-section>
      <house-voice-a11y-section></house-voice-a11y-section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-style-page': HouseStylePage;
  }
}
