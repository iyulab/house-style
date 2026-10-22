export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  // The record's key. The views name it with `rowKey="Id"` — the shape an OData service returns, with no copied `_id`.
  Id: string;
  Customer: string;
  Status: OrderStatus;
  Total: number;
  CreatedAt: string;
}

// Same generalized customer/order vocabulary the existing house-style guide's
// Data Patterns section already uses — kept in sync deliberately, not coincidentally.
export const ORDERS: Order[] = [
  { Id: 'G-2026-0512', Customer: 'Aster Trading', Status: 'pending', Total: 1080000, CreatedAt: '2026-08-05T09:12:00Z' },
  { Id: 'G-2026-0513', Customer: 'Blue Harbor Co.', Status: 'shipped', Total: 360000, CreatedAt: '2026-08-06T11:40:00Z' },
  { Id: 'G-2026-0514', Customer: 'Cedar & Finch', Status: 'delivered', Total: 88000, CreatedAt: '2026-08-06T14:05:00Z' },
  { Id: 'G-2026-0515', Customer: 'Aster Trading', Status: 'pending', Total: 1880000, CreatedAt: '2026-08-07T08:55:00Z' },
  { Id: 'G-2026-0516', Customer: 'Dovetail Supply', Status: 'shipped', Total: 600000, CreatedAt: '2026-08-08T10:20:00Z' },
  { Id: 'G-2026-0517', Customer: 'Cedar & Finch', Status: 'pending', Total: 0, CreatedAt: '2026-08-09T16:30:00Z' },
];

export interface Product {
  Id: string;
  Name: string;
  UnitPrice: number;
}

export const PRODUCTS: Product[] = [
  { Id: 'P-001', Name: 'Steel Bracket 40mm', UnitPrice: 4000 },
  { Id: 'P-002', Name: 'Aluminum Panel A2', UnitPrice: 18000 },
  { Id: 'P-003', Name: 'Gasket Seal Kit', UnitPrice: 7000 },
  { Id: 'P-004', Name: 'Hex Bolt M8x40 (100pk)', UnitPrice: 12000 },
  { Id: 'P-005', Name: 'Industrial Hinge Set', UnitPrice: 28000 },
];

export interface OrderItem {
  Id: string;
  OrderId: string;
  ProductId: string;
  // Snapshots of Product.Name / Product.UnitPrice at the time this line was added — a later
  // rename or price change on Product must never silently change what an already-placed
  // order shows or owes.
  ProductName: string;
  Quantity: number;
  UnitPrice: number;
}

// Seeded so each order's Total (below) equals the sum of its items' Quantity * UnitPrice.
// G-2026-0517 deliberately keeps 0 items so the app has a reachable empty-items state.
//   G-2026-0512: 200*4000 + 40*7000   = 1,080,000
//   G-2026-0513: 20*18000             =   360,000
//   G-2026-0514: 5*12000 + 4*7000     =    88,000
//   G-2026-0515: 60*28000 + 50*4000   = 1,880,000
//   G-2026-0516: 30*18000 + 5*12000   =   600,000
export const ORDER_ITEMS: OrderItem[] = [
  { Id: 'OI-0001', OrderId: 'G-2026-0512', ProductId: 'P-001', ProductName: 'Steel Bracket 40mm', Quantity: 200, UnitPrice: 4000 },
  { Id: 'OI-0002', OrderId: 'G-2026-0512', ProductId: 'P-003', ProductName: 'Gasket Seal Kit', Quantity: 40, UnitPrice: 7000 },
  { Id: 'OI-0003', OrderId: 'G-2026-0513', ProductId: 'P-002', ProductName: 'Aluminum Panel A2', Quantity: 20, UnitPrice: 18000 },
  { Id: 'OI-0004', OrderId: 'G-2026-0514', ProductId: 'P-004', ProductName: 'Hex Bolt M8x40 (100pk)', Quantity: 5, UnitPrice: 12000 },
  { Id: 'OI-0005', OrderId: 'G-2026-0514', ProductId: 'P-003', ProductName: 'Gasket Seal Kit', Quantity: 4, UnitPrice: 7000 },
  { Id: 'OI-0006', OrderId: 'G-2026-0515', ProductId: 'P-005', ProductName: 'Industrial Hinge Set', Quantity: 60, UnitPrice: 28000 },
  { Id: 'OI-0007', OrderId: 'G-2026-0515', ProductId: 'P-001', ProductName: 'Steel Bracket 40mm', Quantity: 50, UnitPrice: 4000 },
  { Id: 'OI-0008', OrderId: 'G-2026-0516', ProductId: 'P-002', ProductName: 'Aluminum Panel A2', Quantity: 30, UnitPrice: 18000 },
  { Id: 'OI-0009', OrderId: 'G-2026-0516', ProductId: 'P-004', ProductName: 'Hex Bolt M8x40 (100pk)', Quantity: 5, UnitPrice: 12000 },
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

/** A read-only account — the same screens with `orders.write` missing: no create/edit actions, and the
 *  new-order screen is blocked by its route guard (reach it by address to see the blocked state). */
export const VIEWER_USER: DemoUser = {
  Id: 'u-2',
  Name: 'Demo Viewer',
  Permissions: ['orders.read'],
};

export const VIEWER_CREDENTIALS = { Username: 'viewer', Password: 'viewer' };

/** Every account the mock backend accepts. */
export const DEMO_ACCOUNTS = [
  { credentials: DEMO_CREDENTIALS, user: DEMO_USER },
  { credentials: VIEWER_CREDENTIALS, user: VIEWER_USER },
];
