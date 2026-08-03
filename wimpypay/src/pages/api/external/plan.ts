import type { NextApiRequest, NextApiResponse } from 'next';
import { createServiceSupabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  const expectedKey = process.env.WIMPYPAY_INTERNAL_API_KEY;
  const providedKey = req.headers['x-internal-api-key'];

  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const product_name = Array.isArray(req.query.product_name)
    ? req.query.product_name[0]
    : req.query.product_name;
  const plan_name = Array.isArray(req.query.plan_name)
    ? req.query.plan_name[0]
    : req.query.plan_name;

  if (!product_name || !plan_name) {
    return res.status(400).json({ ok: false, error: 'product_name-and-plan_name-required' });
  }

  const serviceSupabase = createServiceSupabase();
  const { data: plan, error } = await serviceSupabase
    .from('plans')
    .select('id, price, billing_interval, name, product_name')
    .eq('product_name', product_name)
    .eq('name', plan_name)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }

  if (!plan) {
    return res.status(404).json({ ok: false, error: 'plan-not-found' });
  }

  return res.status(200).json({
    ok: true,
    plan: {
      id: plan.id,
      product_name: plan.product_name,
      name: plan.name,
      price: plan.price,
      billing_interval: plan.billing_interval,
    },
  });
}
