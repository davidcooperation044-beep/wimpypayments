import Link from 'next/link';
import SealBadge from '../components/SealBadge';

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="page-card">
        <header className="page-header">
          <h1 className="brand-title">
            WimpyID <SealBadge />
          </h1>
          <p className="page-copy">Your verification passport for secure access and identity record keeping.</p>
        </header>

        <div className="plan-grid">
          <Link href="/signup" className="button button-primary">
            Sign Up
          </Link>
          <Link href="/login" className="button button-secondary">
            Sign In
          </Link>
          <Link href="/account" className="button button-secondary">
            Account
          </Link>
        </div>
      </div>
    </main>
  );
}
