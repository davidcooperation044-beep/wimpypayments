import { supabase } from '../lib/supabaseClient';

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return {
    ...data,
    email: user.email,
    email_confirmed_at: user.email_confirmed_at,
  };
}
