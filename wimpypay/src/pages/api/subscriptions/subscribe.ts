import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createServiceSupabase } from '../../../lib/supabaseClient';
import { sendReceiptEmail } from '../../../lib/email';

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

  const user = data.user;
  const { plan_id } = req.body as { plan_id?: string };
  if (!plan_id) {
    return res.status(400).json({ ok: false, error: 'plan-id-required' });
  }

  const serviceSupabase = createServiceSupabase();

  const { data: plan, error: planError } = await serviceSupabase
    .from('plans')
    .select('id, price, name')
    .eq('id', plan_id)
    .maybeSingle();

  if (planError || !plan) {
    return res.status(404).json({ ok: false, error: 'plan-not-found' });
  }

  const { data: wallet, error: walletError } = await serviceSupabase
    .from('wallets')
    .select('id, balance')
    .eq('user_id', user.id)
    .maybeSingle();

  if (walletError || !wallet) {
    return res.status(400).json({ ok: false, error: 'wallet-not-found' });
  }

  if (Number(wallet.balance || 0) < Number(plan.price || 0)) {
    return res.status(402).json({ ok: false, error: 'insufficient-funds' });
  }

  const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const chargeAmount = Number(plan.price || 0);
  const chargeReference = `subscription-${user.id}-${Date.now()}`;

  const { data: subscription, error: subscriptionError } = await serviceSupabase.rpc(
    'charge_wallet_and_activate_subscription',
    {
      wallet_id: wallet.id,
      subscriber_user_id: user.id,
      selected_plan_id: plan.id,
      amount: chargeAmount,
      provider_reference: chargeReference,
      subscription_period_end: currentPeriodEnd,
    }
  );

  if (subscriptionError || !subscription) {
    const errorMessage = subscriptionError?.message || 'subscription-failed';
    return res.status(500).json({ ok: false, error: errorMessage });
  }

  try {
    const { data: userData, error: userError } = await serviceSupabase.auth.admin.getUserById(user.id);
    if (userError) {
      console.error('Unable to load user for subscription receipt email:', userError);
    } else if (!userData?.user?.email) {
      console.warn('Receipt email skipped: user has no email on file', user.id);
    } else {
      await sendReceiptEmail({
        userId: user.id,
        toEmail: userData.user.email,
        toName: userData.user.user_metadata?.full_name || undefined,
        type: 'subscription',
        amount: chargeAmount,
        currency: wallet.balance ? 'NGN' : 'NGN',
        reference: chargeReference,
        date: new Date().toISOString(),
        planName: plan.name || 'Subscription',
        nextBillingDate: currentPeriodEnd,
      });
    }
  } catch (emailError) {
    console.error('Failed to send subscription receipt email:', emailError);
  }

  return res.status(200).json({ ok: true, subscription });
}
