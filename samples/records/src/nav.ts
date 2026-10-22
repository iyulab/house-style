import type { SidebarItem } from '@iyulab/modern-app';
import { at } from './base.js';

/** The work areas — a large menu folded into six groups. An item with no screen opens the "not in this sample" screen. */
interface NavGroup {
  label: string;
  icon: string;
  items: { label: string; path?: string }[];
}

export const NAV_GROUPS: NavGroup[] = [
  { label: 'Records', icon: 'folder', items: [
    { label: 'Find records', path: 'records' },
    { label: 'New or edit record' }, { label: 'Bulk import' }, { label: 'Intake and release log' }, { label: 'Change history' },
  ] },
  { label: 'Checkout and transfer', icon: 'arrow-left-right', items: [
    { label: 'Request checkout', path: 'checkout/new' },
    { label: 'Process checkouts' }, { label: 'Receive transfer' }, { label: 'Hand over' }, { label: 'Returns' },
  ] },
  { label: 'Storage', icon: 'grid-3x3', items: [
    { label: 'Storage map', path: 'storage' },
    { label: 'Bulk relocation' }, { label: 'Rack intake' },
  ] },
  { label: 'Closed archive', icon: 'archive', items: [
    { label: 'Box entry' }, { label: 'Find and move boxes' }, { label: 'Disposal schedule' },
  ] },
  { label: 'Reports', icon: 'chart-column', items: [
    { label: 'Custody ledger' }, { label: 'Checkout log' }, { label: 'Work statistics' }, { label: 'Storage usage' },
  ] },
  { label: 'Administration', icon: 'settings', items: [
    { label: 'Notices' }, { label: 'Users' }, { label: 'Roles' }, { label: 'Codes' }, { label: 'Active sessions' },
  ] },
];

/** The address of a screen this sample doesn't build — it carries the name, so that screen says what is missing. */
export const wip = (label: string) => at(`wip?name=${encodeURIComponent(label)}`);

/** What the "Go to" dialog lists — the same source as the sidebar. */
export const ALL_MENUS = [
  { label: 'Today', group: 'Home', href: at() },
  ...NAV_GROUPS.flatMap((g) => g.items.map((i) => ({ label: i.label, group: g.label, href: i.path ? at(i.path) : wip(i.label) }))),
];

export function sidebarMain(openFinder: () => void): SidebarItem[] {
  return [
    { type: 'button', icon: 'search', lib: 'lucide', label: 'Go to… (Ctrl K)', onClick: openFinder },
    { type: 'link', icon: 'house', lib: 'lucide', label: 'Today', href: at() },
    ...NAV_GROUPS.map((g): SidebarItem => ({
      type: 'group',
      icon: g.icon,
      lib: 'lucide',
      label: g.label,
      items: g.items.map((i) => ({
        type: 'link' as const,
        label: i.label,
        href: i.path ? at(i.path) : wip(i.label),
        // A section stays current on its deeper screens.
        pattern: i.path ? `${at(i.path)}{/*}?` : undefined,
      })),
    })),
  ];
}
