import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@iyulab/modern-app/dist/components/PageHeader.js';
import '@iyulab/modern-app/dist/components/GroupBox.js';

/**
 * Deployment & network — what the published packages fetch from outside the app's own origin,
 * and how to keep each one inside a closed network.
 *
 * The host list below is not hand-maintained prose: a repository check derives every runtime
 * host from the packages' published sources and fails when a host is missing here, or when a
 * host listed here no longer appears in any source.
 */
@customElement('house-deployment-section')
export class DeploymentSection extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <u-page-header
        title="Deployment & network"
        subtitle="What the packages load from outside your origin, and how to keep it inside"
      ></u-page-header>

      <u-group-box level="2" title="Closed networks are a normal target">
        <p>
          Line-of-business apps often run where the browser cannot reach the public internet — an
          internal network, a segregated plant or office LAN. Nothing in these packages requires a
          public host to work, but a few features reach one by default. Each row below says when the
          request happens and how to keep it on your own origin.
        </p>
      </u-group-box>

      <u-group-box level="2" title="Requests that leave your origin">
        <table class="prose-table">
          <colgroup><col style="width: 22%" /><col style="width: 26%" /><col style="width: 52%" /></colgroup>
          <thead>
            <tr><th>Host</th><th>Where</th><th>When, and how to keep it inside</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>cdn.jsdelivr.net</code></td>
              <td><code>@iyulab/components</code> — <code>u-icon</code> with <code>lib="bootstrap"</code>, <code>"tabler"</code>, <code>"lucide"</code> or <code>"heroicons"</code>. Also the view switcher in <code>@iyulab/data-components</code> <code>u-data-view</code> before 0.29.0, which asked for Bootstrap icons (0.29.0 draws its own)</td>
              <td>
                The first time an icon from one of those libraries renders. Serve the icons from
                your own bundle instead: register your own library name, or replace a built-in one
                (<code>IconRegistry.register('bootstrap', …)</code> again
                with a resolver that reads local files — registering a name replaces it). <code>lib="internal"</code> and app-registered
                libraries never leave the origin. The app shell takes its icon library from
                configuration, so the shell can follow the same choice.
              </td>
            </tr>
            <tr>
              <td><code>www.google.com</code></td>
              <td><code>@iyulab/chat-components</code> — <code>u-ref-card</code> with <code>type="web"</code></td>
              <td>
                Only when the app opts in with <code>URefCard.defaultFaviconUrl = googleFaviconUrl</code>
                (0.13.0 and later). By default a card requests no favicon; give it a resolver that points
                at your own host instead.
              </td>
            </tr>
            <tr>
              <td><code>www.openstreetmap.org</code></td>
              <td><code>@iyulab/chat-components/extra</code> — <code>u-map-block</code></td>
              <td>The map is an embedded OpenStreetMap page. Don't use this block on a closed network.</td>
            </tr>
            <tr>
              <td><code>www.youtube.com</code>, <code>player.vimeo.com</code></td>
              <td><code>@iyulab/chat-components/extra</code> — <code>u-video-block</code></td>
              <td>Only for YouTube or Vimeo links, which play in the provider's embedded player. A direct video file plays from wherever its URL points.</td>
            </tr>
            <tr>
              <td><code>placehold.co</code>, <code>github.com</code>, <code>developer.mozilla.org</code>, <code>lit.dev</code></td>
              <td><code>@iyulab/u-widgets</code> — the example specs <code>help()</code> returns</td>
              <td>Only if you render those sample specs — they are documentation for building a spec, not defaults.</td>
            </tr>
          </tbody>
        </table>
      </u-group-box>

      <u-group-box level="2" title="Not network requests">
        <p>
          Some URLs in the sources never reach the network: XML and SVG namespace identifiers
          (<code>www.w3.org</code>, <code>schemas.openxmlformats.org</code> in the spreadsheet export),
          and the <code>localhost</code> base used only to parse relative URLs.
        </p>
      </u-group-box>

      <u-group-box level="2" title="This guide itself">
        <p>
          The guide is a public site and uses <code>lib="bootstrap"</code> for a few sidebar icons, so
          it is not an example of a closed-network build — the reference list app under
          <code>examples/list-app</code> is the one to start from.
        </p>
      </u-group-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-deployment-section': DeploymentSection;
  }
}
