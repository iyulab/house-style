import { html } from 'lit';
import { app } from '@iyulab/modern-app';
import { Theme } from '@iyulab/components';

import '@iyulab/enterprise/icons';
import './styles/page-shell.css';
import './pages/HouseStylePage.js';
import './sections/IdentitySection.js';
import './sections/LayoutSection.js';
import './sections/DepthSection.js';
import './sections/DataPatternsSection.js';
import './sections/FlowsSection.js';
import './sections/FeedbackSection.js';
import './sections/VoiceA11ySection.js';

const base = import.meta.env.BASE_URL;

/**
 * The single source for the seven categories — everything that used to require
 * editing two hand-paired arrays (`routes` below, and the sidebar's `main` links)
 * every time a category was added, renamed, or reordered. One array generates both,
 * the same way a real app would generate a nav menu and its routes from one list of
 * screens instead of maintaining the pairing by hand.
 */
const CATEGORIES = [
  { path: 'identity', label: 'Visual identity & tokens', icon: 'identity', render: () => html`<house-identity-section></house-identity-section>` },
  { path: 'layout', label: 'Layout & viewport', icon: 'layout', render: () => html`<house-layout-section></house-layout-section>` },
  { path: 'depth', label: 'Component depth', icon: 'layers', render: () => html`<house-depth-section></house-depth-section>` },
  { path: 'data-patterns', label: 'Data patterns', icon: 'table', render: () => html`<house-data-patterns-section></house-data-patterns-section>` },
  { path: 'flows', label: 'User flows', icon: 'flow', render: () => html`<house-flows-section></house-flows-section>` },
  { path: 'feedback', label: 'Feedback & motion', icon: 'pulse', render: () => html`<house-feedback-section></house-feedback-section>` },
  { path: 'voice-a11y', label: 'Voice, tone & accessibility', icon: 'message', render: () => html`<house-voice-a11y-section></house-voice-a11y-section>` },
];

const navLinkStyles = { host: { '--link-icon-color': 'var(--u-primary-color)' } };

app.load({
  basepath: base,

  // The landing page at the index, plus one route per CATEGORIES entry. Every href
  // below is base-relative (never a literal leading '/') — the router's parseUrl()
  // treats a leading '/' as an absolute, basepath-ignoring path, which would break
  // navigation under GitHub Pages' subpath deployment.
  routes: [
    { index: true, render: () => html`<house-style-page></house-style-page>` },
    ...CATEGORIES.map(c => ({ path: c.path, render: c.render })),
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
      { type: 'link', label: 'Overview', icon: 'home', lib: 'house', styles: navLinkStyles, href: base },
      ...CATEGORIES.map(c => ({
        type: 'link' as const, label: c.label, icon: c.icon, lib: 'house', styles: navLinkStyles, href: `${base}${c.path}`,
      })),
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
    ],

    styles: {
      main: {
        // the sidebar layout's main area ships no default padding; set it here until it does
        padding: 'var(--u-space-3xl, 32px)',
        background: 'var(--u-bg-color-raised, #FAFAFA)',
      },
    },
  },
}).then(() => {
  // Deliberately loaded AFTER `app.load()` resolves, not as a static top-level
  // import. `Theme.init()` (inside `app.load()`) appends the base token sheet to
  // `<head>` at runtime; a statically-imported stylesheet lands in `<head>` before
  // that append happens. Both declare the same `:root` selector at equal
  // specificity, so the later one in DOM order wins the cascade — a static import
  // here would load textually first but lose to the base sheet anyway, and the
  // house values would silently never apply. This is the canonical house-style
  // preset — see `@iyulab/enterprise/src/styles/preset.css` — deferred just long
  // enough to actually win.
  return import('@iyulab/enterprise/styles/preset.css');
}).then(() => {
  // §1's token table renders once, synchronously, when the page first mounts —
  // before this stylesheet has loaded. Without this signal it would keep showing
  // the pre-preset values it happened to read on that first render forever.
  window.dispatchEvent(new Event('house-style:preset-ready'));
});
