export interface NavEntry {
  path: string;
  label: string;
  icon: string;
}

// One array drives both the sidebar links and the route table (Task 3 Step 6) — the same
// "don't hand-pair a nav list and a route list" recipe the guide's own Data Patterns/Flows
// sections document.
export const NAV_ITEMS: NavEntry[] = [
  { path: '/', label: 'Dashboard', icon: 'home' },
  { path: '/orders', label: 'Orders', icon: 'table' },
];
