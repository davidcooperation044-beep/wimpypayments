import type { NextApiRequest, NextApiResponse } from 'next';
import { webhookHandler } from '../../../subscriptions/webhookHandler';
import { paymentProvider } from '../../../lib/paymentProvider';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  const signature = Array.isArray(req.headers['x-paystack-signature'])
    ? req.headers['x-paystack-signature'][0]
    : req.headers['x-paystack-signature'];

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');

  if (!signature || !paymentProvider.verifyWebhookSignature(rawBody, signature, process.env.PAYSTACK_SECRET_KEY || '')) {
    return res.status(401).json({ ok: false, error: 'invalid-signature' });
  }

  try {
    const parsedBody = JSON.parse(rawBody || '{}');
    const result = await webhookHandler(parsedBody);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'webhook-failed' });
  }
}
