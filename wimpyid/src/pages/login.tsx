import { useEffect, useState } from 'react';
import { login } from '../auth/login';
import { loginWithGoogle } from '../auth/loginWithGoogle';
import { buildTokenHandoffRedirect, getAppUrl, isExternalRedirect } from '../lib/redirect';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    setRedirectTo(redirect);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await login({ email, password });
      const target = redirectTo || `${getAppUrl()}/account`;
      const isExternal = isExternalRedirect(redirectTo);

      if (isExternal && result?.session) {
        const { access_token, refresh_token } = result.session;
        window.location.href = buildTokenHandoffRedirect(target, access_token, refresh_token);
      } else {
        window.location.href = target;
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login failed');
    }
  }

  return (
    <main className="page-shell">
      <div className="page-card">
        <header className="page-header">
          <h1 className="brand-title">WimpyID</h1>
          <p className="page-copy">Access your identity pass and verified profile.</p>
        </header>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          <button type="submit" className="button button-primary">
            Sign In
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              if (redirectTo) {
                window.sessionStorage.setItem('wimpyid-post-login-redirect', redirectTo);
              } else {
                window.sessionStorage.removeItem('wimpyid-post-login-redirect');
              }
              loginWithGoogle().catch(() => setMessage('Google sign-in failed'));
            }}
          >
            Sign in with Google
          </button>

          <p>
            <a href="/reset-password" className="link">Forgot password?</a>
          </p>

          {message ? <p className={`form-message ${message.includes('failed') ? 'error' : 'success'}`}>{message}</p> : null}
        </form>
      </div>
    </main>
  );
}
