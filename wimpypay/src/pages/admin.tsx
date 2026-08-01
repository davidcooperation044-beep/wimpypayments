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
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Admin: Webhook & Wallet Inspector</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p><strong>Paystack webhook URL:</strong> {webhookUrl}</p>
      <p>Use this URL in your Paystack dashboard as the webhook URL for successful charges.</p>

      <h2>Wallets</h2>
      {loading ? <p>Loading...</p> : (
        <ul>
          {wallets.map((wallet) => (
            <li key={wallet.id}>
              <strong>{wallet.user_id}</strong> — balance {wallet.balance} {wallet.currency} — updated {wallet.updated_at}
            </li>
          ))}
        </ul>
      )}

      <h2>Transactions</h2>
      {loading ? <p>Loading...</p> : (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              {transaction.type} | {transaction.amount} | {transaction.status} | {transaction.provider_reference || 'n/a'} | {transaction.created_at}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
