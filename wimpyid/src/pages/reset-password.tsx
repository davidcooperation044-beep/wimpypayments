import { useEffect, useState } from 'react';
import { resetPassword } from '../auth/resetPassword';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    setRedirectTo(redirect);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await resetPassword(email, redirectTo || undefined);
      setMessage('Password reset email sent. Check your inbox for the reset link.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send reset email');
    }
  }

  return (
    <main className="page-shell">
      <div className="page-card">
        <header className="page-header">
          <h1 className="brand-title">Reset Password</h1>
          <p className="page-copy">Enter the email address for your WimpyID account and we’ll send a reset link.</p>
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

          <button type="submit" className="button button-primary">
            Send reset link
          </button>

          <p>
            Remembered your password? <Link href="/login">Sign in</Link>
          </p>

          {message ? (
            <p className={`form-message ${message.includes('Unable') ? 'error' : 'success'}`}>{message}</p>
          ) : null}
        </form>
      </div>
    </main>
  );
}
