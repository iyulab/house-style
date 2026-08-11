import { Router } from '@iyulab/router';
import type { RouteContext } from '@iyulab/router';
import { UOutlet } from '@iyulab/router/react';
import { SidebarLayout } from '@iyulab/modern-app/react';
import { auth } from '../lib/auth.js';
import { hasPermission } from '@iyulab/enterprise';
import { NAV_ITEMS } from './nav.js';
import LoginPage from '../pages/LoginPage.js';
import DashboardPage from '../pages/DashboardPage.js';

const base = import.meta.env.BASE_URL + 'app/';

async function requireAuth(ctx: RouteContext): Promise<boolean | string> {
  if (ctx.pathname === base + 'login') return true;
  const user = await auth.fetchMe();
  return user ? true : base + 'login';
}

export function mountAppShell(root: HTMLElement) {
  const outlet = document.createElement('u-outlet');
  root.appendChild(outlet);

  new Router({
    root,
    basepath: base,
    enter: requireAuth,
    routes: [
      { path: 'login', render: () => <LoginPage /> },
      {
        render: () => (
          <SidebarLayout
            config={{
              type: 'sidebar',
              title: 'Orders Reference',
              main: NAV_ITEMS.map((n) => ({ type: 'link', label: n.label, icon: n.icon, href: base.slice(0, -1) + n.path })),
              hasPermission,
            }}
          >
            <UOutlet></UOutlet>
          </SidebarLayout>
        ),
        children: [
          { index: true, render: () => <DashboardPage /> },
        ],
      },
    ],
  });
}
