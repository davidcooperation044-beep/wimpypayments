import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="page-card">
        <header className="page-header">
          <h1 className="brand-title">WimpyPay</h1>
          <p className="page-copy">Your ledger for wallet activity, plans, and transaction history.</p>
        </header>

        <div className="plan-grid">
          <Link href="/dashboard" className="button button-primary">
            Dashboard
          </Link>
          <Link href="/plans" className="button button-secondary">
            Plans
          </Link>
          <Link href="/admin" className="button button-secondary">
            Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
