import { supabase } from '../lib/supabaseClient';

export interface LoginInput {
  email: string;
  password: string;
}

export async function login({ email, password }: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw error;
  return data;
}
