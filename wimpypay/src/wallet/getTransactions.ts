import { supabase } from '../lib/supabaseClient';

export async function getTransactions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('wallet_id', (await supabase.from('wallets').select('id').eq('user_id', user.id).maybeSingle()).data?.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
