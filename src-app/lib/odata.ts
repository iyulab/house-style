import { createODataService } from '@iyulab/enterprise';

export const svc = createODataService({
  baseUrl: window.location.origin,
  onUnauthorized: () => {
    window.location.href = `${import.meta.env.BASE_URL}app/login`;
  },
  messages: { saved: 'Order created', updated: 'Order updated', deleted: 'Order deleted' },
});
