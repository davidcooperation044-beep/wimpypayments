import { supabase } from '../lib/supabaseClient';

export async function getBalance() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data?.balance ?? 0;
}
