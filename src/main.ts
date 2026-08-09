import { html } from 'lit';
import { app } from '@iyulab/modern-app';
import { Theme } from '@iyulab/components';

import './styles/page-shell.css';
import './pages/HouseStylePage.js';

const base = import.meta.env.BASE_URL;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

app.load({
  basepath: base,

  // A single route — the sidebar below never asks the router to resolve anything
  // else, so there is nothing for a GitHub Pages subpath to get wrong.
  routes: [
    { index: true, render: () => html`<house-style-page></house-style-page>` },
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

    // Every item is a button, not a link — scrolling to an in-page section, never
    // navigating. See §2's "Layout & viewport" section for why that matters here.
    main: [
      { type: 'button', label: 'Visual identity & tokens', onClick: () => scrollToSection('identity') },
      { type: 'button', label: 'Layout & viewport', onClick: () => scrollToSection('layout') },
      { type: 'button', label: 'Component depth', onClick: () => scrollToSection('depth') },
      { type: 'button', label: 'Data patterns', onClick: () => scrollToSection('data-patterns') },
      { type: 'button', label: 'User flows', onClick: () => scrollToSection('flows') },
      { type: 'button', label: 'Feedback & motion', onClick: () => scrollToSection('feedback') },
      { type: 'button', label: 'Voice, tone & accessibility', onClick: () => scrollToSection('voice-a11y') },
    ],

    footer: [
      {
        type: 'button',
        label: 'Toggle theme',
        onClick: () => Theme.set(Theme.resolved() === 'dark' ? 'light' : 'dark'),
      },
      {
        type: 'button',
        label: 'View source',
        onClick: () => window.open('https://github.com/iyulab/house-style', '_blank'),
      },
    ],
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
