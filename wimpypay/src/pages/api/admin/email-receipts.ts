import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createServiceSupabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

  const { data, error: sessionError } = await authClient.auth.getUser(token);
  if (sessionError || !data?.user) {
    return res.status(401).json({ ok: false, error: 'invalid-session' });
  }

  const user = data.user;
  const serviceSupabase = createServiceSupabase();
  const { data: profile, error: profileError } = await serviceSupabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

  if (!profile.is_admin) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

  const limit = Math.min(Number(req.query.limit || 100), 1000);
  const offset = Math.max(Number(req.query.offset || 0), 0);

  const receiptsResult = await serviceSupabase
    .from('email_receipts')
    .select('id, user_id, type, transaction_reference, sent_at, status, error_message, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (receiptsResult.error) {
    return res.status(500).json({ ok: false, error: receiptsResult.error.message });
  }

  const rows = receiptsResult.data || [];

  // Enrich with user email when possible
  const enriched = await Promise.all(
    rows.map(async (r: any) => {
      try {
        const { data: userData } = await serviceSupabase.auth.admin.getUserById(r.user_id);
        return { ...r, user_email: userData?.user?.email ?? null };
      } catch (e) {
        return { ...r, user_email: null };
      }
    })
  );

  return res.status(200).json({ ok: true, receipts: enriched });
}
