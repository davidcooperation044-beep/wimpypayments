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
    <form onSubmit={handleSubmit}>
      <h1>Sign up</h1>
      <input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Sign up</button>
      <button type="button" onClick={() => loginWithGoogle().catch(() => setMessage('Google sign-in failed'))}>Sign in with Google</button>
      <p>{message}</p>
    </form>
  );
}
