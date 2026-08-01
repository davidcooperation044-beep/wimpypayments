import { supabase } from '../lib/supabaseClient';

export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account`,
    },
  });

  if (error) throw error;
  return data;
}
