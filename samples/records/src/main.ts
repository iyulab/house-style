import '../../../styles/index.css';
import './app.css';
import '@iyulab/components';
import '@iyulab/data-components';
// `u-list-page` registers from its subpath — the main entry carries only the helpers.
import '@iyulab/enterprise/list-page';
import { html } from 'lit';
import { app } from '@iyulab/modern-app';
import { BASE } from './base.js';
import { sidebarMain, wip } from './nav.js';
import './finder.js';
import type { RcFinder } from './finder.js';
import './pages/home.js';
import './pages/records.js';
import './pages/checkout.js';
import './pages/storage.js';
import './pages/wip.js';

const finder = document.createElement('rc-finder') as RcFinder;
const openFinder = () => finder.open();

// Ctrl K (⌘K on a Mac) opens "Go to" from any screen.
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openFinder();
  }
});

await app.load({
  root: document.body,
  basepath: BASE,
  layout: {
    type: 'sidebar',
    logo: { icon: 'archive', lib: 'lucide' },
    title: 'Records Center',
    subtitle: 'Records custody',
    main: sidebarMain(openFinder),
    footer: [
      { type: 'link', icon: 'circle-help', lib: 'lucide', label: 'Help', href: wip('Help') },
      {
        type: 'menu',
        label: 'Dana Kim',
        description: 'Records Center · Administrator',
        avatar: { initials: 'DK' },
        items: [
          { label: 'House style guide', icon: 'book-open', lib: 'lucide', onClick: () => { window.location.href = import.meta.env.BASE_URL; } },
          { label: 'Sign out', icon: 'log-out', lib: 'lucide', onClick: () => app.info('This sample has no sign-in.') },
        ],
      },
    ],
  },
  routes: [
    { index: true, render: () => html`<rc-home></rc-home>` },
    // The list's criteria (status tab, search, category, department, period) live in the address — a reload, Back or a
    // shared link opens the same list. Keyed on the path, a criteria change reaches the screen as new properties instead
    // of rebuilding it: the loaded rows and the selection stay.
    {
      path: 'records',
      key: (ctx) => ctx.pathname,
      render: (ctx) => html`<rc-records .status=${ctx.query.get('status') ?? ''} .q=${ctx.query.get('q') ?? ''}
        .category=${ctx.query.get('category') ?? ''} .department=${ctx.query.get('department') ?? ''}
        .range=${ctx.query.get('range') ?? ''}></rc-records>`,
    },
    // Opens with the records picked on the list already in the request (`?ids=`).
    { path: 'checkout/new', render: (ctx) => html`<rc-checkout .preset=${(ctx.query.get('ids') ?? '').split(',').filter(Boolean)}></rc-checkout>` },
    { path: 'storage', key: (ctx) => ctx.pathname, render: (ctx) => html`<rc-storage .find=${ctx.query.get('find') ?? ''}></rc-storage>` },
    { path: 'wip', render: (ctx) => html`<rc-wip .name=${ctx.query.get('name') ?? ''}></rc-wip>` },
  ],
});

document.body.appendChild(finder);
