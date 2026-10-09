import { createODataService } from '@iyulab/enterprise';

/**
 * The session ended — go to sign-in. One policy for every request the app makes: the service's writes and reads, and
 * the list sources (`useODataSource`/`createODataSource`), which take the same handler.
 */
export function onUnauthorized(): void {
  history.pushState({}, '', `${import.meta.env.BASE_URL}app/login`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export const svc = createODataService({
  baseUrl: window.location.origin,
  onUnauthorized,
  messages: { saved: 'Order created', updated: 'Order updated', deleted: 'Order deleted' },
});
