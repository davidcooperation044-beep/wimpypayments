export interface PaymentProviderChargeInput {
  amount: number;
  currency?: string;
  email?: string;
  reference?: string;
  callbackUrl?: string;
}

export interface PaymentProviderChargeResult {
  reference: string;
  status: string;
  authorizationUrl?: string;
}

export class PaymentProvider {
  async initializeCharge(input: PaymentProviderChargeInput): Promise<PaymentProviderChargeResult> {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        amount: Math.round(input.amount * 100),
        currency: input.currency || 'NGN',
        reference: input.reference || `paystack-${Date.now()}`,
        callback_url: input.callbackUrl,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
      throw new Error(data.message || 'Paystack initialization failed');
    }

    return {
      reference: data.data.reference,
      status: data.data.status,
      authorizationUrl: data.data.authorization_url,
    };
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
    return hash === signature;
  }

  async confirmPayment(reference: string): Promise<{ status: string }> {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY || ''}`,
      },
    });

    const data = await response.json();
    return { status: data?.data?.status || 'failed' };
  }
}

export const paymentProvider = new PaymentProvider();
