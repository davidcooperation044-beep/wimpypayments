import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { paymentProvider } from '../../../lib/paymentProvider';
import { createServiceSupabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

  const { amount } = req.body as { amount?: number };
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ ok: false, error: 'invalid-amount' });
  }

  if (amount < 100) {
    return res.status(400).json({ ok: false, error: 'minimum-amount-is-100' });
  }

  const reference = `wallet-${data.user.id}-${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const callbackUrl = `${appUrl}/dashboard?funding=pending&reference=${encodeURIComponent(reference)}`;

  const serviceSupabase = createServiceSupabase();
  const { data: userData, error: userError } = await serviceSupabase.auth.admin.getUserById(data.user.id);
  const email = userError || !userData?.user?.email ? data.user.email || 'demo@example.com' : userData.user.email;

  const result = await paymentProvider.initializeCharge({
    amount,
    currency: 'NGN',
    email,
    reference,
    callbackUrl,
  });

  return res.status(200).json({ ok: true, authorizationUrl: result.authorizationUrl, reference: result.reference });
}
