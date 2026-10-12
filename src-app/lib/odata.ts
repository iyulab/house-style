import { createODataService } from '@iyulab/enterprise';
import { navigate } from '@iyulab/router';

// One session policy for every request: the list sources take it from the service (`svc.sourceDefaults`).
export const svc = createODataService({
  baseUrl: window.location.origin,
  // The session ended under this screen — replace it, so Back after signing in again does not return to it.
  onUnauthorized: () => navigate(`${import.meta.env.BASE_URL}app/login`, { replace: true }),
  messages: { saved: 'Order created', updated: 'Order updated', deleted: 'Order deleted' },
});
