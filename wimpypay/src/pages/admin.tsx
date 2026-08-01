import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface WalletRow {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

interface TransactionRow {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  status: string;
  provider_reference: string | null;
  created_at: string;
}

export default function AdminPage() {
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session?.access_token) {
        setError('Please sign in to access admin data.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/inspect', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Failed to load admin data');
      }
      setWebhookUrl(result.webhookUrl || '');
      setWallets(result.wallets || []);
      setTransactions(result.transactions || []);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <main className="page-shell">
      <div className="page-card">
        <header className="page-header">
          <h1 className="brand-title">Admin: Webhook & Wallet Inspector</h1>
          <p className="page-copy">A utilitarian view of wallets and transactions for internal review.</p>
        </header>

        {error && <p className="form-message error">{error}</p>}

        <div className="content-card">
          <p><strong>Paystack webhook URL:</strong> {webhookUrl}</p>
          <p>Use this URL in your Paystack dashboard as the webhook URL for successful charges.</p>
        </div>

        <section style={{ marginTop: 24 }}>
          <h2>Wallets</h2>
          {loading ? <p>Loading...</p> : (
            <table className="simple-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Balance</th>
                  <th>Currency</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.id}>
                    <td>{wallet.user_id}</td>
                    <td>₦{wallet.balance.toFixed(2)}</td>
                    <td>{wallet.currency}</td>
                    <td>{new Date(wallet.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section style={{ marginTop: 24 }}>
          <h2>Transactions</h2>
          {loading ? <p>Loading...</p> : (
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.type}</td>
                    <td>₦{transaction.amount.toFixed(2)}</td>
                    <td>{transaction.status}</td>
                    <td>{transaction.provider_reference || 'n/a'}</td>
                    <td>{new Date(transaction.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
