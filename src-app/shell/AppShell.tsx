import { Router } from '@iyulab/router';
import type { RouteContext } from '@iyulab/router';
import { UOutlet } from '@iyulab/router/react';
import { SidebarLayout, ScreenObserver } from '@iyulab/modern-app/react';
import { auth } from '../lib/auth.js';
import { hasPermission } from '@iyulab/enterprise';
import { NAV_ITEMS } from './nav.js';
import LoginPage from '../pages/LoginPage.js';
import DashboardPage from '../pages/DashboardPage.js';
import OrdersListPage from '../pages/OrdersListPage.js';
import OrderDetailPage from '../pages/OrderDetailPage.js';
import NewOrderPage from '../pages/NewOrderPage.js';

const base = import.meta.env.BASE_URL + 'app/';

/** Matches `SidebarLayout`'s own documented default split — see the note below. */
const BREAKPOINTS: [number, number] = [768, 1024];

/**
 * `SidebarLayout`'s `state` defaults to the hardcoded `'default'` (desktop) and is meant to be
 * corrected by a `screen-resize` window event on mount. But this shell's `SidebarLayout` mounts
 * lazily — only once `requireAuth` resolves — and `ScreenObserver` dispatches its one-time
 * initial reading synchronously in its constructor, before that. By the time `SidebarLayout`
 * connects and starts listening, the initial dispatch has already happened and gone, and since
 * the viewport hasn't changed since, no later resize ever arrives to correct it — the sidebar
 * was permanently stuck at `default`, full-width, on every screen size (confirmed: state stayed
 * `'default'` on a 390px-wide viewport with no further events firing). `ScreenObserver` below
 * still drives every *later* resize correctly, once the shell is listening — only the first
 * paint needs this synchronous starting point, computed independently of that race.
 */
function initialSidebarState(): 'default' | 'slim' | 'mobile' {
  const [small, medium] = BREAKPOINTS;
  const width = window.innerWidth;
  return width < small ? 'mobile' : width < medium ? 'slim' : 'default';
}

async function requireAuth(ctx: RouteContext): Promise<boolean | string> {
  if (ctx.pathname === base + 'login') return true;
  const user = await auth.fetchMe();
  return user ? true : base + 'login';
}

async function signOut() {
  await auth.logout();
  // A hard `location.href` navigation would reload the page — and with it, the MSW mock
  // backend's in-memory session (see mocks/handlers.ts). Route client-side instead, same
  // idiom as LoginPage.tsx's post-login redirect.
  history.pushState({}, '', base + 'login');
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function mountAppShell(root: HTMLElement) {
  // `SidebarLayout`'s `:host` is `height: 100%` — it fills whatever height its parent chain
  // gives it, and by default that chain resolves to nothing (`document.body`'s own height is
  // `auto`, i.e. its content's height). `@iyulab/modern-app`'s own `app.load()` entry point
  // sets exactly this when mounting to `document.body`; this app calls `Router` + `SidebarLayout`
  // directly instead (for per-route control `app.load()` doesn't expose), so it has to set it
  // itself — same values, same condition.
  if (root === document.body) {
    document.body.style.margin = '0';
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
  }

  const outlet = document.createElement('u-outlet');
  root.appendChild(outlet);

  // `SidebarLayout`'s large/medium/small chrome switch, from here on, is driven by the
  // `screen-resize` window event — `app.load()` creates the `ScreenObserver` that dispatches
  // it, but this app bypasses `app.load()` (see comment above), so nothing did.
  new ScreenObserver({ element: root, breakpoints: BREAKPOINTS });

  new Router({
    root,
    basepath: base,
    enter: requireAuth,
    routes: [
      { path: 'login', render: () => <LoginPage /> },
      {
        render: () => (
          <SidebarLayout
            state={initialSidebarState()}
            config={{
              type: 'sidebar',
              title: 'Orders Reference',
              main: NAV_ITEMS.map((n) => ({ type: 'link', label: n.label, icon: n.icon, lib: n.lib, href: base.slice(0, -1) + n.path })),
              footer: [{ type: 'button', label: 'Sign out', icon: 'box-arrow-right', lib: 'bootstrap', onClick: signOut }],
              hasPermission,
            }}
          >
            <UOutlet></UOutlet>
          </SidebarLayout>
        ),
        children: [
          { index: true, render: () => <DashboardPage /> },
          { path: 'orders', render: () => <OrdersListPage /> },
          { path: 'orders/new', render: () => <NewOrderPage /> },
          { path: 'orders/:id', render: (ctx) => <OrderDetailPage orderId={ctx.params.id as string} /> },
        ],
      },
    ],
  });
}
