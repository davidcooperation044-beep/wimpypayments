import { useState } from 'react';
import { login } from '../auth/login';
import { loginWithGoogle } from '../auth/loginWithGoogle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login({ email, password });
      setMessage('Login successful');
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
            onClick={() => loginWithGoogle().catch(() => setMessage('Google sign-in failed'))}
          >
            Sign in with Google
          </button>

          {message ? <p className={`form-message ${message.includes('failed') ? 'error' : 'success'}`}>{message}</p> : null}
        </form>
      </div>
    </main>
  );
}
