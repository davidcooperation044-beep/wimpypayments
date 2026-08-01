import { supabase } from '../lib/supabaseClient';

export interface ProfileUpdateInput {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export async function updateProfile(updates: ProfileUpdateInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
