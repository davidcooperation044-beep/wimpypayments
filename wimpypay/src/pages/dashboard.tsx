import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getBalance } from '../wallet/getBalance';
import { getTransactions } from '../wallet/getTransactions';

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setBalance(await getBalance());
      setTransactions(await getTransactions());
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session?.access_token) {
        setError('Please sign in to access webhook diagnostics.');
        return;
      }
      const response = await fetch('/api/admin/inspect', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Failed to load webhook URL');
      }
      setWebhookUrl(result.webhookUrl || '');
    }

    load();
  }, []);

  return (
    <main className="page-shell">
      <div className="page-card">
        <header className="page-header">
          <h1 className="brand-title">Dashboard</h1>
          <p className="page-copy">Your ledger snapshot and recent payment activity.</p>
        </header>

        {error && <p className="form-message error">{error}</p>}

        <div>
          <p className="ledger-balance">₦{balance.toFixed(2)}</p>
          <p className="page-copy">Current wallet balance</p>
        </div>

        <div className="content-card" style={{ marginTop: 24 }}>
          <p className="page-copy">
            <strong>Paystack webhook URL:</strong> {webhookUrl}
          </p>
          <p className="page-copy">Open the admin page to inspect wallet and transaction updates after each webhook event.</p>
        </div>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 16 }}>Recent transactions</h2>
          <ul className="transaction-list">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="transaction-row">
                <span className="transaction-col">{new Date(transaction.created_at).toLocaleDateString()}</span>
                <span className="transaction-col">{transaction.type}</span>
                <span className="transaction-amount">₦{transaction.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
