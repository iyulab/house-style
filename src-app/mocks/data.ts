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
  { _id: 'G-2026-0512', Id: 'G-2026-0512', Customer: 'Aster Trading', Status: 'pending', Total: 1080000, CreatedAt: '2026-08-05T09:12:00Z' },
  { _id: 'G-2026-0513', Id: 'G-2026-0513', Customer: 'Blue Harbor Co.', Status: 'shipped', Total: 360000, CreatedAt: '2026-08-06T11:40:00Z' },
  { _id: 'G-2026-0514', Id: 'G-2026-0514', Customer: 'Cedar & Finch', Status: 'delivered', Total: 88000, CreatedAt: '2026-08-06T14:05:00Z' },
  { _id: 'G-2026-0515', Id: 'G-2026-0515', Customer: 'Aster Trading', Status: 'pending', Total: 1880000, CreatedAt: '2026-08-07T08:55:00Z' },
  { _id: 'G-2026-0516', Id: 'G-2026-0516', Customer: 'Dovetail Supply', Status: 'shipped', Total: 600000, CreatedAt: '2026-08-08T10:20:00Z' },
  { _id: 'G-2026-0517', Id: 'G-2026-0517', Customer: 'Cedar & Finch', Status: 'pending', Total: 0, CreatedAt: '2026-08-09T16:30:00Z' },
];

export interface Product {
  _id: string;
  Id: string;
  Name: string;
  UnitPrice: number;
}

export const PRODUCTS: Product[] = [
  { _id: 'P-001', Id: 'P-001', Name: 'Steel Bracket 40mm', UnitPrice: 4000 },
  { _id: 'P-002', Id: 'P-002', Name: 'Aluminum Panel A2', UnitPrice: 18000 },
  { _id: 'P-003', Id: 'P-003', Name: 'Gasket Seal Kit', UnitPrice: 7000 },
  { _id: 'P-004', Id: 'P-004', Name: 'Hex Bolt M8x40 (100pk)', UnitPrice: 12000 },
  { _id: 'P-005', Id: 'P-005', Name: 'Industrial Hinge Set', UnitPrice: 28000 },
];

export interface OrderItem {
  _id: string;
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
  { _id: 'OI-0001', Id: 'OI-0001', OrderId: 'G-2026-0512', ProductId: 'P-001', ProductName: 'Steel Bracket 40mm', Quantity: 200, UnitPrice: 4000 },
  { _id: 'OI-0002', Id: 'OI-0002', OrderId: 'G-2026-0512', ProductId: 'P-003', ProductName: 'Gasket Seal Kit', Quantity: 40, UnitPrice: 7000 },
  { _id: 'OI-0003', Id: 'OI-0003', OrderId: 'G-2026-0513', ProductId: 'P-002', ProductName: 'Aluminum Panel A2', Quantity: 20, UnitPrice: 18000 },
  { _id: 'OI-0004', Id: 'OI-0004', OrderId: 'G-2026-0514', ProductId: 'P-004', ProductName: 'Hex Bolt M8x40 (100pk)', Quantity: 5, UnitPrice: 12000 },
  { _id: 'OI-0005', Id: 'OI-0005', OrderId: 'G-2026-0514', ProductId: 'P-003', ProductName: 'Gasket Seal Kit', Quantity: 4, UnitPrice: 7000 },
  { _id: 'OI-0006', Id: 'OI-0006', OrderId: 'G-2026-0515', ProductId: 'P-005', ProductName: 'Industrial Hinge Set', Quantity: 60, UnitPrice: 28000 },
  { _id: 'OI-0007', Id: 'OI-0007', OrderId: 'G-2026-0515', ProductId: 'P-001', ProductName: 'Steel Bracket 40mm', Quantity: 50, UnitPrice: 4000 },
  { _id: 'OI-0008', Id: 'OI-0008', OrderId: 'G-2026-0516', ProductId: 'P-002', ProductName: 'Aluminum Panel A2', Quantity: 30, UnitPrice: 18000 },
  { _id: 'OI-0009', Id: 'OI-0009', OrderId: 'G-2026-0516', ProductId: 'P-004', ProductName: 'Hex Bolt M8x40 (100pk)', Quantity: 5, UnitPrice: 12000 },
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
