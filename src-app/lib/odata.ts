import { createODataService } from '@iyulab/enterprise';

export const svc = createODataService({
  baseUrl: window.location.origin,
  onUnauthorized: () => {
    history.pushState({}, '', `${import.meta.env.BASE_URL}app/login`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  },
  messages: { saved: 'Order created', updated: 'Order updated', deleted: 'Order deleted' },
});
