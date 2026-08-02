import { useEffect, useState } from 'react';
import { signup } from '../auth/signup';
import { loginWithGoogle } from '../auth/loginWithGoogle';
import { isExternalRedirect } from '../lib/redirect';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    setRedirectTo(redirect);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const isExternal = isExternalRedirect(redirectTo);

      if (redirectTo && isExternal) {
        window.sessionStorage.setItem('wimpyid-post-login-redirect', redirectTo);
      } else {
        window.sessionStorage.removeItem('wimpyid-post-login-redirect');
      }

      await signup({
        email,
        password,
        fullName,
        redirectTo: redirectTo && !isExternal ? redirectTo : undefined,
      });
      setMessage('Signup successful. Check your email for verification.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Signup failed');
    }
  }

  return (
    <main className="page-shell">
      <div className="page-card">
        <header className="page-header">
          <h1 className="brand-title">WimpyID</h1>
          <p className="page-copy">Create your identity passport and manage verified access.</p>
        </header>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="button button-primary">
            Sign Up
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

          {message ? (
            <p className={`form-message ${message.includes('failed') ? 'error' : 'success'}`}>{message}</p>
          ) : null}
        </form>
      </div>
    </main>
  );
}
