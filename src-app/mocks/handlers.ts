import { http, HttpResponse } from 'msw';
import { ORDERS, DEMO_USER, DEMO_CREDENTIALS, type Order } from './data.js';

// In-memory session + mutable order list, scoped to one page load — this is a demo backend,
// not a persistence layer. Reset on every reload, same as the fixture arrays it wraps.
let session: typeof DEMO_USER | null = null;
const orders: Order[] = ORDERS.map((o) => ({ ...o }));

export const handlers = [
  http.get('*/api/auth/me', () => {
    return session ? HttpResponse.json(session) : new HttpResponse(null, { status: 401 });
  }),

  http.post('*/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { Username?: string; Password?: string };
    if (body.Username === DEMO_CREDENTIALS.Username && body.Password === DEMO_CREDENTIALS.Password) {
      session = DEMO_USER;
      return HttpResponse.json(DEMO_USER);
    }
    return new HttpResponse(null, { status: 401 });
  }),

  http.post('*/api/auth/logout', () => {
    session = null;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/$data/Orders', () => {
    // Filtering/pagination happen client-side in this demo (matches the existing house-style
    // Data Patterns list-screen recipe) — the mock always returns the full set.
    return HttpResponse.json({ value: orders });
  }),

  http.patch('*/$data/Orders(:id)', async ({ params, request }) => {
    const order = orders.find((o) => o.Id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    const patch = (await request.json()) as Partial<Order>;
    Object.assign(order, patch);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/$data/Orders', async ({ request }) => {
    const body = (await request.json()) as Partial<Order>;
    // Deliberate trigger for the "raw network error" branch of the two-tier error handling
    // recipe — a customer name any real order would never have.
    if (body.Customer === 'NETWORK_ERROR_TEST') {
      return HttpResponse.error();
    }
    // Deliberate trigger for the "typed API error" branch — a customer name any real order
    // would never have.
    if (body.Customer === 'DUPLICATE_TEST') {
      return HttpResponse.json({ Message: 'An order for this customer is already in progress.' }, { status: 409 });
    }
    const newId = `G-2026-${String(1000 + orders.length).slice(-4)}`;
    const created: Order = {
      _id: newId,
      Id: newId,
      Customer: body.Customer ?? 'Unknown',
      Status: 'pending',
      Total: body.Total ?? 0,
      CreatedAt: new Date(0).toISOString(),
    };
    orders.unshift(created);
    return HttpResponse.json(created, { status: 201 });
  }),
];
