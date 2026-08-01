import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createServiceSupabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'missing-authorization' });
  }

  const token = authHeader.replace('Bearer ', '');
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://example.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key',
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  const { data, error: sessionError } = await authClient.auth.getUser(token);
  if (sessionError || !data?.user) {
    return res.status(401).json({ ok: false, error: 'invalid-session' });
  }

  const user = data.user;
  const serviceSupabase = createServiceSupabase();
  const { data: profile, error: profileError } = await serviceSupabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

  if (!profile.is_admin) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

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
