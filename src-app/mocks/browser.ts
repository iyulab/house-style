import { setupWorker } from 'msw/browser';
import { handlers } from './handlers.js';

const worker = setupWorker(...handlers);

export function startMockWorker(): Promise<void> {
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  }).then(() => {});
}
