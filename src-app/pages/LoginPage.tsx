import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import type { UInput as UInputElement } from '@iyulab/components';
import { UAlert, UButton, UInput, UDrawer } from '../lib/ui-react.js';
import { auth } from '../lib/auth.js';
import { DEMO_CREDENTIALS, VIEWER_CREDENTIALS } from '../mocks/data.js';
import './LoginPage.css';

export default function LoginPage() {
  const [brandIn, setBrandIn] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const usernameRef = useRef<UInputElement>(null);

  useEffect(() => {
    const t1 = window.setTimeout(() => setBrandIn(true), 300);
    const t2 = window.setTimeout(() => setDrawerOpen(true), 700);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);

  // Sign-in is the one thing this screen is for, so the username field takes focus as soon as
  // the panel opens. Nothing else places it: this route sits outside the app shell (which does
  // this for its routes), and the panel is a non-modal drawer, which by design does not move
  // focus when it opens.
  useEffect(() => {
    if (!drawerOpen) return;
    const field = usernameRef.current;
    void field?.updateComplete.then(() => field.focus());
  }, [drawerOpen]);

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
      setError(result.message);
      setPassword('');
      return;
    }
    // Route client-side rather than with a hard `location.href` redirect: a reload restarts the
    // whole app (and resets the MSW mock backend's in-memory orders — see mocks/handlers.ts) for no
    // reason. The Router's own popstate handler re-runs the auth guard in place.
    history.pushState({}, '', import.meta.env.BASE_URL + 'app/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  return (
    <main className="login-page">
      <div className={`login-page__brand${brandIn ? ' login-page__brand--in' : ''}`}>
        <h1>Orders Reference</h1>
        <p>A working app built from the iyulab component libraries.</p>
      </div>

      <UDrawer
        open={drawerOpen}
        placement="right"
        mode="non-modal"
        closeOn={[]}
        aria-labelledby="login-title"
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
            <h2 id="login-title">Sign in</h2>
            <div className="login-page__form-accent" />
          </div>

          <p className="login-page__hint">
            This is a demo backend (mocked, no real accounts) — sign in with{' '}
            <code>{DEMO_CREDENTIALS.Username}</code> / <code>{DEMO_CREDENTIALS.Password}</code>, or{' '}
            <code>{VIEWER_CREDENTIALS.Username}</code> / <code>{VIEWER_CREDENTIALS.Password}</code> for a
            read-only account.
          </p>

          {/* One lock for the whole form while signing in — a disable boundary, not a visual group. */}
          <fieldset disabled={loading} style={{ display: 'contents' }}>
          <UInput
            ref={usernameRef}
            label="Username"
            name="username"
            type="text"
            autocomplete="username"
            value={username}
            onChange={(e) => setUsername((e.target as UInputElement).value ?? '')}
          />
          <UInput
            label="Password"
            name="password"
            type="password"
            autocomplete="current-password"
            value={password}
            onChange={(e) => setPassword((e.target as UInputElement).value ?? '')}
          />

          {error && <UAlert open status="error">{error}</UAlert>}

          <UButton type="submit" color="primary" loading={loading}>
            Sign in
          </UButton>
          </fieldset>
        </form>
      </UDrawer>
    </main>
  );
}
