import { supabase } from '../lib/supabaseClient';

export interface SignupInput {
  email: string;
  password: string;
  fullName?: string;
}

export async function signup({ email, password, fullName }: SignupInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account`,
      data: { full_name: fullName || '' },
    },
  });

  if (error) throw error;
  return data;
}
