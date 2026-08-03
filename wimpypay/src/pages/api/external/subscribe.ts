import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceSupabase } from '../../../lib/supabaseClient';
import { sendReceiptEmail } from '../../../lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  const expectedKey = process.env.WIMPYPAY_INTERNAL_API_KEY;
  const providedKey = req.headers['x-internal-api-key'];

  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const { user_id, product_name, plan_name, reference } = req.body as {
    user_id?: string;
    product_name?: string;
    plan_name?: string;
    reference?: string;
  };

  if (!user_id || !product_name || !plan_name || !reference) {
    return res.status(400).json({ ok: false, error: 'invalid-request' });
  }

  const serviceSupabase = createServiceSupabase();
  const { data: plan, error: planError } = await serviceSupabase
    .from('plans')
    .select('id, price, name, product_name')
    .eq('product_name', product_name)
    .eq('name', plan_name)
    .maybeSingle();

  if (planError) {
    return res.status(500).json({ ok: false, error: planError.message });
  }

  if (!plan) {
    return res.status(404).json({ ok: false, error: 'plan-not-found' });
  }

  const { data: wallet, error: walletError } = await serviceSupabase
    .from('wallets')
    .select('id, balance')
    .eq('user_id', user_id)
    .maybeSingle();

  if (walletError) {
    return res.status(500).json({ ok: false, error: walletError.message });
  }

  if (!wallet) {
    return res.status(404).json({ ok: false, error: 'wallet-not-found' });
  }

  const amount = Number(plan.price || 0);
  const currentBalance = Number(wallet.balance || 0);

  if (currentBalance < amount) {
    return res.status(402).json({
      ok: false,
      error: 'insufficient-funds',
      requiredAmount: amount,
      currentBalance,
    });
  }

  const chargeReference = reference;
  const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: subscription, error: subscriptionError } = await serviceSupabase.rpc(
    'charge_wallet_and_activate_subscription',
    {
      wallet_id: wallet.id,
      subscriber_user_id: user_id,
      selected_plan_id: plan.id,
      amount,
      provider_reference: chargeReference,
      subscription_period_end: currentPeriodEnd,
    }
  );

  if (subscriptionError || !subscription) {
    if (subscriptionError?.message?.includes('insufficient-funds')) {
      return res.status(402).json({
        ok: false,
        error: 'insufficient-funds',
        requiredAmount: amount,
        currentBalance,
      });
    }
    const errorMessage = subscriptionError?.message || 'subscription-failed';
    return res.status(500).json({ ok: false, error: errorMessage });
  }

  try {
    const { data: userData, error: userError } = await serviceSupabase.auth.admin.getUserById(user_id);
    if (!userError && userData?.user?.email) {
      await sendReceiptEmail({
        userId: user_id,
        toEmail: userData.user.email,
        toName: userData.user.user_metadata?.full_name || undefined,
        type: 'subscription',
        amount,
        currency: 'NGN',
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
