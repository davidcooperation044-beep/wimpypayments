import { useState } from 'react';
import { signup } from '../auth/signup';
import { loginWithGoogle } from '../auth/loginWithGoogle';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await signup({ email, password, fullName });
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
            onClick={() => loginWithGoogle().catch(() => setMessage('Google sign-in failed'))}
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
