import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceSupabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  const serviceSupabase = createServiceSupabase();

  const [walletsResult, transactionsResult] = await Promise.all([
    serviceSupabase
      .from('wallets')
      .select('id, user_id, balance, currency, updated_at')
      .order('updated_at', { ascending: false }),
    serviceSupabase
      .from('transactions')
      .select('id, wallet_id, type, amount, status, provider_reference, created_at')
      .order('created_at', { ascending: false }),
  ]);

  if (walletsResult.error) {
    return res.status(500).json({ ok: false, error: walletsResult.error.message });
  }

  if (transactionsResult.error) {
    return res.status(500).json({ ok: false, error: transactionsResult.error.message });
  }

  return res.status(200).json({
    ok: true,
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/webhook/payments`,
    wallets: walletsResult.data ?? [],
    transactions: transactionsResult.data ?? [],
  });
}
