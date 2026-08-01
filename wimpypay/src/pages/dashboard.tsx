import { useEffect, useState } from 'react';
import { getBalance } from '../wallet/getBalance';
import { getTransactions } from '../wallet/getTransactions';

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>('');

  useEffect(() => {
    async function load() {
      setBalance(await getBalance());
      setTransactions(await getTransactions());
      const response = await fetch('/api/admin/inspect');
      const result = await response.json();
      setWebhookUrl(result.webhookUrl || '');
    }

    load();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>
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
