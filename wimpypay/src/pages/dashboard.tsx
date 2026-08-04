import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getBalance } from '../wallet/getBalance';
import { getTransactions } from '../wallet/getTransactions';
import { fundWallet } from '../wallet/fundWallet';

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fundingAmount, setFundingAmount] = useState('500');
  const [fundingPending, setFundingPending] = useState(false);
  const [fundingBanner, setFundingBanner] = useState<string | null>(null);
  const [isFunding, setIsFunding] = useState(false);

  async function loadWalletData() {
    setBalance(await getBalance());
    setTransactions(await getTransactions());
  }

  useEffect(() => {
    async function load() {
      await loadWalletData();
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fundingParam = params.get('funding');
    const reference = params.get('reference');

    if (fundingParam === 'pending' && reference) {
      setFundingPending(true);
      setFundingBanner('Payment received, confirming with your bank…');

      const startedAt = Date.now();
      const timer = window.setInterval(async () => {
        await loadWalletData();
        const latestTransactions = await getTransactions();
        const hasMatchingReference = latestTransactions.some((txn: any) => txn.provider_reference === reference);
        if (hasMatchingReference) {
          window.clearInterval(timer);
          setFundingBanner(null);
          setFundingPending(false);
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.delete('funding');
          nextUrl.searchParams.delete('reference');
          window.history.replaceState({}, '', nextUrl.toString());
          return;
        }

        if (Date.now() - startedAt > 30000) {
          window.clearInterval(timer);
          setFundingBanner('Still processing — refresh in a moment.');
          setFundingPending(false);
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.delete('funding');
          nextUrl.searchParams.delete('reference');
          window.history.replaceState({}, '', nextUrl.toString());
        }
      }, 2000);

      return () => window.clearInterval(timer);
    }
  }, []);

  async function handleFundWallet(e: React.FormEvent) {
    e.preventDefault();
    setIsFunding(true);
    setError(null);

    try {
      const amount = Number(fundingAmount);
      if (!Number.isFinite(amount) || amount < 100) {
        throw new Error('Enter a funding amount of at least ₦100');
      }

      const result = await fundWallet({ amount, provider: 'paystack' });
      window.location.href = result.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Funding failed');
      setIsFunding(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="page-card">
        <header className="page-header">
          <h1 className="brand-title">Dashboard</h1>
          <p className="page-copy">Your ledger snapshot and recent payment activity.</p>
        </header>

        {error && <p className="form-message error">{error}</p>}
        {fundingBanner && <p className="form-message success">{fundingBanner}</p>}

        <form onSubmit={handleFundWallet} style={{ marginTop: 24, marginBottom: 24 }}>
          <label>
            Amount (NGN)
            <input
              type="number"
              min="100"
              step="0.01"
              value={fundingAmount}
              onChange={(e) => setFundingAmount(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 8, marginBottom: 12 }}
            />
          </label>
          <button type="submit" className="button button-primary" disabled={isFunding}>
            {isFunding ? 'Preparing checkout…' : 'Fund wallet'}
          </button>
        </form>

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
