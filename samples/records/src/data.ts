/** Sample data — made up. No real organisation, person or record. */

export type RecordStatus = 'Stored' | 'Checked out' | 'Overdue' | 'Incomplete' | 'Closed';

export const STATUSES: RecordStatus[] = ['Stored', 'Checked out', 'Overdue', 'Incomplete', 'Closed'];

export interface RecordFile extends Record<string, unknown> {
  id: string;
  title: string;
  category: string;
  department: string;
  pages: number;
  createdAt: string;
  status: RecordStatus;
  /** `<floor>-<rack>-<shelf>-<sector>` when shelved, `Checked out`, a box code once closed, empty when not yet placed. */
  location: string;
}

/** The app's own status → tag tone. The house style gives the tones; which status gets which is the domain's call. */
export const STATUS_COLOR: Record<RecordStatus, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  Stored: 'success',
  'Checked out': 'info',
  Overdue: 'warning',
  Incomplete: 'danger',
  Closed: 'neutral',
};

export const CATEGORIES = ['Contract', 'Invoice', 'Personnel', 'Legal', 'Project'];
export const DEPARTMENTS = ['Procurement', 'Accounting', 'People', 'Legal', 'Engineering'];

const TITLES: Record<string, string[]> = {
  Contract: ['Supply agreement', 'Service agreement', 'Lease agreement', 'Framework agreement'],
  Invoice: ['Invoice batch', 'Expense claims', 'Purchase orders'],
  Personnel: ['Employee file', 'Training records', 'Onboarding packet'],
  Legal: ['Case file', 'Board minutes', 'Regulatory filing'],
  Project: ['Project closeout', 'Design review pack', 'Site inspection report'],
};
const PARTIES = [
  'Harbor Logistics', 'Maple Foods', 'Summit Metals', 'Riverside Clinic', 'Orbit Media', 'Cedar Labs',
  'Bluebird Retail', 'Granite Works', 'Northgate Energy', 'Willow Partners', 'Lumen Studio', 'Atlas Freight',
];
const WEIGHTED: RecordStatus[] = ['Stored', 'Stored', 'Stored', 'Stored', 'Stored', 'Checked out', 'Incomplete', 'Overdue', 'Closed'];

/** Deterministic pseudo-random — a reload shows the same records. */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const RECORDS: RecordFile[] = Array.from({ length: 128 }, (_, i) => {
  const r = (k: number) => rand(i * 7 + k);
  const status = WEIGHTED[Math.floor(r(1) * WEIGHTED.length)];
  const category = CATEGORIES[Math.floor(r(2) * CATEGORIES.length)];
  const kinds = TITLES[category];
  const day = new Date(Date.UTC(2026, 9, 21 - Math.floor(i / 3)));
  return {
    id: `RC-${String(24812 - i * 7).padStart(6, '0')}`,
    title: `${kinds[Math.floor(r(3) * kinds.length)]} — ${PARTIES[Math.floor(r(4) * PARTIES.length)]}`,
    category,
    department: DEPARTMENTS[Math.floor(r(10) * DEPARTMENTS.length)],
    pages: Math.round(category === 'Legal' ? 120 + r(9) * 780 : 12 + r(9) * 240),
    createdAt: day.toISOString().slice(0, 10),
    status,
    location:
      status === 'Checked out' || status === 'Overdue' ? 'Checked out'
      : status === 'Closed' ? `BOX B-0${140 + (i % 9)}`
      : status === 'Incomplete' ? ''
      : `L2-${String(1 + (i % 12)).padStart(3, '0')}-${1 + (i % 5)}-${1 + (i % 4)}`,
  };
});

/** Storage floors — the home screen's usage card and the storage map read the same source. */
export const SHELVES = 5;
export const SECTORS = 4;
export const CAPACITY = 40;

export interface Cell { shelf: number; sector: number; count: number }
export interface Rack { no: number; cells: Cell[]; pct: number }
export interface Floor { id: string; label: string; racks: Rack[] }

/** Sample occupancy, seeded per floor. Two sectors of Level 2's R-007 hold more than they should. */
function makeRacks(seed: number, count: number, fill: number): Rack[] {
  return Array.from({ length: count }, (_, i) => {
    const no = i + 1;
    const cells: Cell[] = [];
    for (let s = 1; s <= SHELVES; s++) {
      for (let c = 1; c <= SECTORS; c++) {
        let n = Math.round(Math.min(1, (((no * 37 + s * 11 + c * 7 + no * s + seed) % 11) / 10) * fill) * CAPACITY);
        if (seed === 0 && no === 7 && s === 4 && (c === 2 || c === 3)) n = CAPACITY + 3;
        cells.push({ shelf: s, sector: c, count: n });
      }
    }
    const pct = Math.round((cells.reduce((sum, c) => sum + Math.min(c.count, CAPACITY), 0) / (cells.length * CAPACITY)) * 100);
    return { no, cells, pct };
  });
}

export const FLOORS: Floor[] = [
  { id: 'L2', label: 'Level 2', racks: makeRacks(0, 12, 1) },
  { id: 'L3', label: 'Level 3', racks: makeRacks(5, 12, 0.75) },
  { id: 'B1', label: 'Basement vault', racks: makeRacks(3, 8, 1.4) },
];

export const floorPct = (f: Floor) => Math.round(f.racks.reduce((n, r) => n + r.pct, 0) / f.racks.length);
export const rackName = (no: number) => `R-${String(no).padStart(3, '0')}`;
