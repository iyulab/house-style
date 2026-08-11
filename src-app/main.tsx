import { startMockWorker } from './mocks/browser.js';
import { bootTheme } from './lib/theme.js';
import { mountAppShell } from './shell/AppShell.js';

Promise.all([startMockWorker(), bootTheme()])
  .then(() => {
    mountAppShell(document.body);
  })
  .catch((error) => {
    console.error('Failed to start the app:', error);
  });
