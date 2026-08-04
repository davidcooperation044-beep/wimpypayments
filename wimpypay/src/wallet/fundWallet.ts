import { supabase } from '../lib/supabaseClient';

export interface FundWalletInput {
  amount: number;
  provider: 'paystack' | 'flutterwave';
}

export async function fundWallet({ amount, provider }: FundWalletInput) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('User not authenticated');

  if (provider !== 'paystack') {
    throw new Error('Only Paystack is currently wired for test funding');
  }

  const response = await fetch('/api/wallet/fund', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Funding initialization failed');
  }

  return result;
}
