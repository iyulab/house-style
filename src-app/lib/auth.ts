import { createAuthClient } from '@iyulab/enterprise';
import type { DemoUser } from '../mocks/data.js';

export const auth = createAuthClient<DemoUser, { Username: string; Password: string }>({
  meUrl: '/api/auth/me',
  loginUrl: '/api/auth/login',
  logoutUrl: '/api/auth/logout',
  getPermissions: (u) => u.Permissions,
  messages: { invalidCredentials: 'Incorrect username or password.' },
});
