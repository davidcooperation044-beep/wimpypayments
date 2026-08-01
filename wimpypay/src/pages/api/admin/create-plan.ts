import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceSupabase } from '../../../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'missing-authorization' });
  }

  const token = authHeader.replace('Bearer ', '');
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://example.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key',
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  const { data: sessionPayload, error: sessionError } = await authClient.auth.getUser(token);
  if (sessionError || !sessionPayload?.user) {
    return res.status(401).json({ ok: false, error: 'invalid-session' });
  }

  const user = sessionPayload.user;
  const serviceSupabase = createServiceSupabase();
  const { data: profile, error: profileError } = await serviceSupabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_admin) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

  const { product_name, name, price, billing_interval } = req.body || {};
  if (!product_name || !name || !price || !billing_interval) {
    return res.status(400).json({ ok: false, error: 'invalid-plan-data' });
  }

  const { data, error } = await serviceSupabase
    .from('plans')
    .insert({ product_name, name, price: Number(price), billing_interval })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }

  return res.status(200).json({ ok: true, plan: data });
}
