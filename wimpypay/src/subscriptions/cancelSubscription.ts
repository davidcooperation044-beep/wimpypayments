import { supabase } from '../lib/supabaseClient';

export async function cancelSubscription(subscriptionId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
