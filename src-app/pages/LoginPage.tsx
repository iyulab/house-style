import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import * as React from 'react';
import { createComponent } from '@lit/react';
import {
  UInput as UInputElement,
  UDrawer as UDrawerElement,
} from '@iyulab/components';
import { UButton, UInput } from '../lib/ui-react.js';
import { auth } from '../lib/auth.js';
import { DEMO_CREDENTIALS } from '../mocks/data.js';
import './LoginPage.css';

// `@iyulab/components/react` cannot be imported anywhere in this program.
// Narrowing several individual barrel imports (this app's own theme setup,
// a few call sites in `@iyulab/enterprise` and `@iyulab/modern-app`, and this
// package's pre-existing Lit guide entry point) reduces the conflict but
// doesn't close it. The remaining source is `@iyulab/modern-app`'s own
// layout components (already loaded via this app's shell) and this
// package's pre-existing guide sections, both of which register custom
// elements via `@iyulab/components/dist/components/*/U*.js` side-effect
// imports. That path looks like it targets the real built `dist`, but
// `@iyulab/components`' `package.json` redirects `"./dist/*": "./src/*"` in
// this local workspace, so it silently resolves to the same source classes
// `/react`'s built typings conflict with under `declare global` — same tag,
// two nominal types, across roughly three dozen import lines spanning two
// packages, one of them a shared layout library. Not something this one
// page can fix on its own. `UButton`/`UInput` are shared from
// `../lib/ui-react.js` (other pages need them too); `UDrawer` is only used
// here, so it stays as a local `createComponent` wrapper from the same
// source class everything else in this program already resolves to.
const UDrawer = createComponent({
  react: React,
  tagName: 'u-drawer',
  elementClass: UDrawerElement,
  events: {},
});

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
