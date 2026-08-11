export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  // `u-rich-table` reads `row._id` directly for selection/activation identity — without it
  // every row collapses to the same `undefined` key and selecting one selects all (confirmed
  // against the component's own source warning). Kept equal to `Id` here since this demo has
  // no scenario where a stable key needs to outlive a changing display code.
  _id: string;
  Id: string;
  Customer: string;
  Status: OrderStatus;
  Total: number;
  CreatedAt: string;
}

// Same generalized customer/order vocabulary the existing house-style guide's
// Data Patterns section already uses — kept in sync deliberately, not coincidentally.
export const ORDERS: Order[] = [
  { _id: 'G-2026-0512', Id: 'G-2026-0512', Customer: 'Aster Trading', Status: 'pending', Total: 1240000, CreatedAt: '2026-08-05T09:12:00Z' },
  { _id: 'G-2026-0513', Id: 'G-2026-0513', Customer: 'Blue Harbor Co.', Status: 'shipped', Total: 380500, CreatedAt: '2026-08-06T11:40:00Z' },
  { _id: 'G-2026-0514', Id: 'G-2026-0514', Customer: 'Cedar & Finch', Status: 'delivered', Total: 92000, CreatedAt: '2026-08-06T14:05:00Z' },
  { _id: 'G-2026-0515', Id: 'G-2026-0515', Customer: 'Aster Trading', Status: 'pending', Total: 2010000, CreatedAt: '2026-08-07T08:55:00Z' },
  { _id: 'G-2026-0516', Id: 'G-2026-0516', Customer: 'Dovetail Supply', Status: 'shipped', Total: 615000, CreatedAt: '2026-08-08T10:20:00Z' },
  { _id: 'G-2026-0517', Id: 'G-2026-0517', Customer: 'Cedar & Finch', Status: 'pending', Total: 148000, CreatedAt: '2026-08-09T16:30:00Z' },
];

export interface DemoUser {
  Id: string;
  Name: string;
  Permissions: string[];
}

export const DEMO_USER: DemoUser = {
  Id: 'u-1',
  Name: 'Demo Operator',
  Permissions: ['orders.read', 'orders.write'],
};

export const DEMO_CREDENTIALS = { Username: 'demo', Password: 'demo' };
