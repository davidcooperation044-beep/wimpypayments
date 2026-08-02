import { supabase } from '../lib/supabaseClient';

export interface SignupInput {
  email: string;
  password: string;
  fullName?: string;
  redirectTo?: string;
}

export async function signup({ email, password, fullName, redirectTo }: SignupInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account`,
      data: { full_name: fullName || '' },
    },
  });

  if (error) throw error;
  return data;
}
