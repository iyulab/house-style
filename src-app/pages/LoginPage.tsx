import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import type { UInput as UInputElement } from '@iyulab/components';
import { UButton, UInput, UDrawer } from '../lib/ui-react.js';
import { auth } from '../lib/auth.js';
import { DEMO_CREDENTIALS } from '../mocks/data.js';
import './LoginPage.css';

export default function LoginPage() {
  const [brandIn, setBrandIn] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t1 = window.setTimeout(() => setBrandIn(true), 300);
    const t2 = window.setTimeout(() => setDrawerOpen(true), 700);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter a username and password.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await auth.login({ Username: username.trim(), Password: password });
    setLoading(false);
    if (!result.ok) {
      setError(result.message ?? 'Sign-in failed.');
      setPassword('');
      return;
    }
    // A hard `location.href` redirect would reload the page — and with it, the
    // MSW mock backend's in-memory session (see mocks/handlers.ts), stranding
    // the freshly-authenticated user back on /login. Route client-side instead
    // so the Router's own popstate handler re-runs the auth guard in place.
    history.pushState({}, '', import.meta.env.BASE_URL + 'app/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  return (
    <div className="login-page">
      <div className={`login-page__brand${brandIn ? ' login-page__brand--in' : ''}`}>
        <h1>Orders Reference</h1>
        <p>A working app built from the iyulab component libraries.</p>
      </div>

      <UDrawer
        open={drawerOpen}
        placement="right"
        mode="non-modal"
        closeOn={[]}
        className={`login-page__panel${focused ? ' login-page__panel--focused' : ''}`}
        style={{ ['--drawer-size' as string]: 'min(420px, 100vw)' } as CSSProperties}
      >
        <div slot="header" style={{ display: 'none' }} />
        <form
          className="login-page__form"
          onSubmit={handleSubmit}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={() => setFocused(false)}
        >
          <div>
            <h2>Sign in</h2>
            <div className="login-page__form-accent" />
          </div>

          <p className="login-page__hint">
            This is a demo backend (mocked, no real accounts) — sign in with{' '}
            <code>{DEMO_CREDENTIALS.Username}</code> / <code>{DEMO_CREDENTIALS.Password}</code>.
          </p>

          <UInput
            label="Username"
            name="username"
            type="text"
            autocomplete="username"
            value={username}
            disabled={loading}
            onChange={(e) => setUsername((e.target as UInputElement).value ?? '')}
          />
          <UInput
            label="Password"
            name="password"
            type="password"
            autocomplete="current-password"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword((e.target as UInputElement).value ?? '')}
          />

          {error && <div className="login-page__error" role="alert">{error}</div>}

          <UButton type="submit" color="primary" loading={loading} disabled={loading}>
            Sign in
          </UButton>
        </form>
      </UDrawer>
    </div>
  );
}
