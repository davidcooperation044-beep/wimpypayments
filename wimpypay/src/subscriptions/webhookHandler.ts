import { createServiceSupabase } from '../lib/supabaseClient';

const serviceSupabase = createServiceSupabase();

export interface WebhookEvent {
  event: string;
  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    email?: string;
    customer?: { email?: string };
  };
}

export async function webhookHandler(payload: unknown) {
  const event = payload as WebhookEvent;
  const reference = event?.data?.reference;

  if (!reference || event?.event !== 'charge.success') {
    return { ok: true, ignored: true };
  }

  const amount = Number(event?.data?.amount || 0) / 100;
  const match = reference.match(/^wallet-([0-9a-fA-F-]+)-\d+$/);
  const userId = match?.[1];

  if (!userId) {
    return { ok: false, error: 'reference-missing-user' };
  }

  let wallet = null;
  const { data: existingWallet, error: walletError } = await serviceSupabase
    .from('wallets')
    .select('id, user_id, balance')
    .eq('user_id', userId)
    .maybeSingle();

  if (walletError) throw walletError;

  if (existingWallet) {
    wallet = existingWallet;
  } else {
    const { data: createdWallet, error: createError } = await serviceSupabase
      .from('wallets')
      .insert({ user_id: userId, balance: 0, currency: 'NGN' })
      .select('id, user_id, balance')
      .single();

    if (createError) throw createError;
    wallet = createdWallet;
  }

  const { data: existingTransaction } = await serviceSupabase
    .from('transactions')
    .select('id')
    .eq('provider_reference', reference)
    .maybeSingle();

  if (existingTransaction) {
    return { ok: true, ignored: true, message: 'transaction-already-processed' };
  }

  const nextBalance = Number(wallet.balance || 0) + amount;

  await serviceSupabase.from('wallets').update({ balance: nextBalance }).eq('id', wallet.id);

  await serviceSupabase.from('transactions').insert({
    wallet_id: wallet.id,
    type: 'fund',
    amount,
    status: 'success',
    provider_reference: reference,
  });

  return { ok: true, balance: nextBalance };
}
