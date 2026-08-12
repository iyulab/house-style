export interface NavEntry {
  path: string;
  label: string;
  icon: string;
  /** Registered `IconRegistry` library the icon name resolves against (see
   *  `@iyulab/components`'s `icons.ts`) — without this, `u-icon` falls back to fetching
   *  `<iconBasepath>/<name>.svg`, a path this app never provisions. */
  lib: string;
}

// One array drives both the sidebar links and the route table (Task 3 Step 6) — the same
// "don't hand-pair a nav list and a route list" recipe the guide's own Data Patterns/Flows
// sections document.
export const NAV_ITEMS: NavEntry[] = [
  { path: '/', label: 'Dashboard', icon: 'house', lib: 'bootstrap' },
  { path: '/orders', label: 'Orders', icon: 'table', lib: 'bootstrap' },
];
