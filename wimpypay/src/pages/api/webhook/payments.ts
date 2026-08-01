import type { NextApiRequest, NextApiResponse } from 'next';
import { webhookHandler } from '../../../subscriptions/webhookHandler';
import { paymentProvider } from '../../../lib/paymentProvider';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  const signature = Array.isArray(req.headers['x-paystack-signature'])
    ? req.headers['x-paystack-signature'][0]
    : req.headers['x-paystack-signature'];
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

  if (!signature || !paymentProvider.verifyWebhookSignature(rawBody, signature, process.env.PAYSTACK_SECRET_KEY || '')) {
    return res.status(401).json({ ok: false, error: 'invalid-signature' });
  }

  try {
    const result = await webhookHandler(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'webhook-failed' });
  }
}
