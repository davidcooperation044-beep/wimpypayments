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

  const { user_id, amount, currency, reference, description } = req.body as {
    user_id?: string;
    amount?: number;
    currency?: string;
    reference?: string;
    description?: string;
  };

  if (!user_id || typeof amount !== 'number' || amount <= 0 || !reference) {
    return res.status(400).json({ ok: false, error: 'invalid-request' });
  }

  const serviceSupabase = createServiceSupabase();
  const { data: chargeResult, error: chargeError } = await serviceSupabase.rpc(
    'charge_wallet_for_external_purchase',
    {
      wallet_user_id: user_id,
      purchase_amount: amount,
      purchase_currency: currency || 'NGN',
      purchase_reference: reference,
      purchase_description: description || 'External purchase',
    }
  );

  if (chargeError || !chargeResult) {
    const errorMessage = chargeError?.message || 'charge-failed';
    return res.status(400).json({ ok: false, error: errorMessage });
  }

  const result = chargeResult as { transaction_reference?: string; new_balance?: number; currency?: string };

  try {
    const { data: userData, error: userError } = await serviceSupabase.auth.admin.getUserById(user_id);
    if (!userError && userData?.user?.email) {
      await sendReceiptEmail({
        userId: user_id,
        toEmail: userData.user.email,
        toName: userData.user.user_metadata?.full_name || undefined,
        type: 'external_purchase',
        amount,
        currency: result.currency || currency || 'NGN',
        reference: result.transaction_reference || reference,
        date: new Date().toISOString(),
        balance: Number(result.new_balance || 0),
        description: description || 'External purchase',
      });
    }
  } catch (emailError) {
    console.error('Failed to send external purchase receipt email:', emailError);
  }

  return res.status(200).json({
    ok: true,
    transaction_reference: result.transaction_reference || reference,
    new_balance: result.new_balance ?? 0,
    currency: result.currency || currency || 'NGN',
  });
}
