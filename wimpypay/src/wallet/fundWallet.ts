import { supabase } from '../lib/supabaseClient';
import { paymentProvider } from '../lib/paymentProvider';

export interface FundWalletInput {
  amount: number;
  provider: 'paystack' | 'flutterwave';
}

export async function fundWallet({ amount, provider }: FundWalletInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  if (provider !== 'paystack') {
    throw new Error('Only Paystack is currently wired for test funding');
  }

  const result = await paymentProvider.initializeCharge({
    amount,
    currency: 'NGN',
    email: user.email || 'demo@example.com',
    reference: `wallet-${user.id}-${Date.now()}`,
  });

  return result;
}
