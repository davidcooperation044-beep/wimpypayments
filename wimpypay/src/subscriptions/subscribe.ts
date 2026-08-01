import { supabase } from '../lib/supabaseClient';

export interface SubscribeInput {
  plan_id: string;
}

export async function subscribe({ plan_id }: SubscribeInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.from('subscriptions').insert({
    user_id: user.id,
    plan_id,
    status: 'active',
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }).select().single();

  if (error) throw error;
  return data;
}
