import { supabase } from '../lib/supabaseClient';

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account`,
  });

  if (error) throw error;
  return data;
}
