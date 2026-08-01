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
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p><strong>Balance:</strong> {balance}</p>
      <p><strong>Paystack webhook URL:</strong> {webhookUrl}</p>
      <p>Open the admin page to inspect wallet and transaction updates after each webhook event.</p>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>{transaction.type} - {transaction.amount} - {transaction.status}</li>
        ))}
      </ul>
    </div>
  );
}
