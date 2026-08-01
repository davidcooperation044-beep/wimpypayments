import { supabase } from '../lib/supabaseClient';

export interface CreatePlanInput {
  product_name: string;
  name: string;
  price: number;
  billing_interval: 'monthly' | 'yearly';
}

export async function createPlan(plan: CreatePlanInput) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('User not authenticated');

  const response = await fetch('/api/admin/create-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(plan),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Plan creation failed');
  return data.plan;
}
