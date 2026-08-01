import { supabase } from '../lib/supabaseClient';

export async function verifyEmail(email: string, token: string, type: 'signup' | 'recovery' | 'invite' = 'signup') {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type });
  if (error) throw error;
  return data;
}
