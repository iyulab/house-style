import { html } from 'lit';
import { app } from '@iyulab/modern-app';
import { Theme } from '@iyulab/components/dist/utilities/Theme.js';

// The canonical house-style preset, loaded the way its own header documents it: a plain
// static import. Before @iyulab/components 1.44.0 that silently did nothing here —
// `Theme.init()` appended the base token sheet at the end of `<head>`, so it outran a
// statically imported sheet at equal specificity. The base sheet now sits ahead of the
// document's other styles, so no sequencing is needed and none is done.
import '@iyulab/enterprise/styles/preset.css';
import '@iyulab/enterprise/icons';
import '@iyulab/components/dist/components/popover/UPopover.js';
import '@iyulab/components/dist/components/menu/UMenu.js';
import '@iyulab/components/dist/components/menu-item/UMenuItem.js';
import './styles/page-shell.css';
import { CATEGORIES, TIERS } from './categories.js';
import './pages/HouseStylePage.js';
import './sections/IdentitySection.js';
import './sections/LayoutSection.js';
import './sections/DepthSection.js';
import './sections/DataPatternsSection.js';
import './sections/FlowsSection.js';
import './sections/FeedbackSection.js';
import './sections/VoiceA11ySection.js';
import './sections/DeploymentSection.js';

const base = import.meta.env.BASE_URL;

/** Each category's page — keyed by the path `categories.ts` declares. */
const SECTIONS: Record<string, () => unknown> = {
  identity: () => html`<house-identity-section></house-identity-section>`,
  layout: () => html`<house-layout-section></house-layout-section>`,
  depth: () => html`<house-depth-section></house-depth-section>`,
  'data-patterns': () => html`<house-data-patterns-section></house-data-patterns-section>`,
  flows: () => html`<house-flows-section></house-flows-section>`,
  feedback: () => html`<house-feedback-section></house-feedback-section>`,
  'voice-a11y': () => html`<house-voice-a11y-section></house-voice-a11y-section>`,
  deployment: () => html`<house-deployment-section></house-deployment-section>`,
};

const navLinkStyles = { host: { '--link-icon-color': 'var(--u-primary-color)' } };

app.load({
  basepath: base,

  // The landing page at the index, plus one route per CATEGORIES entry. Every href
  // below is base-relative (never a literal leading '/') — the router's parseUrl()
  // treats a leading '/' as an absolute, basepath-ignoring path, which would break
  // navigation under GitHub Pages' subpath deployment.
  routes: [
    { index: true, render: () => html`<house-style-page></house-style-page>` },
    ...CATEGORIES.map(c => ({ path: c.path, render: SECTIONS[c.path] })),
  ],

  theme: {
    default: 'light',
    store: {
      type: 'cookie',
      prefix: 'house-style-',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime(), // 30 days
    },
  },

  layout: {
    type: 'sidebar',
    breakpoints: [768, 1024],
    title: 'House Style',

    // Every item is a link to a real route now — `selected` (current-route
    // highlight) comes for free from SidebarLayout's own URLPattern matching,
    // no extra wiring needed.
    main: [
      { type: 'link', label: 'Start here', icon: 'home', lib: 'house', styles: navLinkStyles, href: base },
      // Three tiers, the order design-system docs are read in — foundations, then patterns built
      // from them, then whole screens. The same `TIERS` list drives the landing page's map.
      ...TIERS.map(tier => ({
        type: 'section' as const,
        title: tier,
        items: CATEGORIES.filter(c => c.tier === tier).map(c => ({
          type: 'link' as const, label: c.label, icon: c.icon, lib: 'house', styles: navLinkStyles, href: `${base}${c.path}`,
        })),
      })),
      // `type: 'group'` (collapsible sub-nav) is a real `SidebarItem` variant this guide's
      // own sidebar had never exercised — a real app groups external/secondary links this
      // way (e.g. under "Resources") rather than flattening everything into `main`.
      {
        type: 'group',
        label: 'Resources',
        icon: 'collection',
        lib: 'bootstrap',
        styles: navLinkStyles,
        items: [
          { type: 'link', label: 'GitHub', icon: 'github', lib: 'bootstrap', href: 'https://github.com/iyulab/house-style', target: '_blank' },
          { type: 'link', label: 'npm package', icon: 'box-seam', lib: 'bootstrap', href: 'https://www.npmjs.com/org/iyulab', target: '_blank' },
        ],
      },
      // A popup-style submenu (u-popover, not the accordion above) — the third
      // SidebarItem shape this guide is meant to model. `placement` is picked from the
      // sidebar's own state rather than fixed to one side: on mobile the sidebar widens to
      // occupy nearly the full screen, so a sideways flyout has no room on either side and
      // would render off-screen (documented at length in @iyulab/modern-app's
      // skills/modern-app/references/layout.md, "Popup-style submenus").
      {
        type: 'html',
        render: (state) => html`
          <u-sidebar-button id="house-more-trigger" icon="three-dots" lib="bootstrap" label="More"></u-sidebar-button>
          <u-popover for="#house-more-trigger"
            placement=${state.startsWith('mobile') ? 'bottom-start' : 'right-start'}
            @pick=${(e: Event) => (e.currentTarget as HTMLElement & { hide(): void }).hide()}
          >
            <u-menu>
              <u-menu-item @pick=${() => navigator.clipboard?.writeText(location.href).then(() => app.success('Link copied'))}>
                Copy link to this page
              </u-menu-item>
              <u-menu-item @pick=${() => window.open('https://github.com/iyulab/house-style/issues/new', '_blank')}>
                Report an issue
              </u-menu-item>
            </u-menu>
          </u-popover>
        `,
      },
    ],

    footer: [
      {
        type: 'button',
        label: 'Toggle theme',
        icon: 'contrast',
        lib: 'house',
        styles: { icon: { color: 'var(--u-primary-color)' } },
        onClick: () => Theme.set(Theme.resolved() === 'dark' ? 'light' : 'dark'),
      },
      {
        type: 'button',
        label: 'View source',
        icon: 'code',
        lib: 'house',
        styles: { icon: { color: 'var(--u-primary-color)' } },
        onClick: () => window.open('https://github.com/iyulab/house-style', '_blank'),
      },
      {
        type: 'button',
        label: 'Open the reference app',
        icon: 'box-arrow-up-right',
        lib: 'bootstrap',
        styles: { icon: { color: 'var(--u-primary-color)' } },
        // A real navigation, not client-side routing — `app/` is a second, separate Vite
        // HTML entry (its own React app + Router), not a route this guide's own Router
        // knows about.
        onClick: () => { window.location.href = `${base}app/`; },
      },
    ],

    styles: {
      main: {
        background: 'var(--u-bg-color-raised, #FAFAFA)',
      },
    },
  },
});
