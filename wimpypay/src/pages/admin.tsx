import { useEffect, useState } from 'react';

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

  useEffect(() => {
    async function load() {
      setLoading(true);
      const response = await fetch('/api/admin/inspect');
      const result = await response.json();
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
