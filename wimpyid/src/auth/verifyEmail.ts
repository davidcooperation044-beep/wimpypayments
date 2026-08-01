import { supabase } from '../lib/supabaseClient';

export async function verifyEmail(token: string, type: 'signup' | 'recovery' | 'invite' = 'signup') {
  const { data, error } = await supabase.auth.verifyOtp({ token, type });
  if (error) throw error;
  return data;
}
