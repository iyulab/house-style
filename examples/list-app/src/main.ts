import { html } from 'lit';
import { app } from '@iyulab/modern-app';
import '@iyulab/house-style';                     // the house theme: tokens, type, density, patterns
import './ListScreenDemo.ts';                    // the recipe below — rename its tag when it is yours

await app.load({
  root: document.body,
  layout: { type: 'sidebar', title: 'Orders', main: [{ type: 'link', label: 'Orders', href: '/' }] },
  routes: [{ path: '/', render: () => html`<house-data-patterns-list-screen></house-data-patterns-list-screen>` }],
});
