import { supabase } from '../lib/supabaseClient';

export interface SubscribeInput {
  plan_id: string;
}

export async function subscribe({ plan_id }: SubscribeInput) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('User not authenticated');

  const response = await fetch('/api/subscriptions/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ plan_id }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Subscription failed');
  return data.subscription;
}
