import { createRoot } from 'react-dom/client';
import { startMockWorker } from './mocks/browser.js';

startMockWorker().then(() => {
  const root = document.body.appendChild(document.createElement('div'));
  createRoot(root).render(<div>Mock worker started</div>);
});
