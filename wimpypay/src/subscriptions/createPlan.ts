import { supabase } from '../lib/supabaseClient';

export interface CreatePlanInput {
  product_name: string;
  name: string;
  price: number;
  billing_interval: 'monthly' | 'yearly';
}

export async function createPlan(plan: CreatePlanInput) {
  const { data, error } = await supabase.from('plans').insert(plan).select().single();
  if (error) throw error;
  return data;
}
