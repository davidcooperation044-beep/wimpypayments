import { Resend } from 'resend';
import { createServiceSupabase } from './supabaseClient';

export interface SendReceiptEmailInput {
  userId: string;
  toEmail: string;
  toName?: string;
  type: 'wallet_funding' | 'subscription' | 'external_purchase';
  amount: number;
  currency: string;
  reference: string;
  date: string;
  planName?: string;
  nextBillingDate?: string;
  balance?: number;
  description?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://wimpypay.example.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function buildEmailHtml(input: SendReceiptEmailInput, title: string, subtitle: string, detailsHtml: string) {
  const bodyText = input.toName ? `Hi ${input.toName},` : 'Hello,';
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4efe4;color:#23262E;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4efe4;padding:24px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 16px 32px rgba(15,27,51,0.08);">
            <tr>
              <td style="background:#0F1B33;padding:24px;">
                <h1 style="margin:0;color:#fff;font-family:Georgia, 'Times New Roman', serif;font-size:24px;letter-spacing:0.02em;">Wimpy Pay</h1>
                <p style="margin:8px 0 0;color:#C9A227;font-family:Georgia, 'Times New Roman', serif;font-size:16px;">${subtitle}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">${bodyText}</p>
                <h2 style="margin:0 0 16px;color:#0F1B33;font-family:Georgia, 'Times New Roman', serif;font-size:22px;letter-spacing:0.01em;">${title}</h2>

                ${detailsHtml}

                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px;border-collapse:collapse;">
                  <tr>
                    <td style="padding:16px;background:#F7F2E7;border-radius:12px;">
                      <p style="margin:0;font-size:14px;line-height:1.6;color:#23262E;">
                        Reference: <span style="font-family:ui-monospace, 'SFMono-Regular', Menlo, Monaco, monospace;color:#0F1B33;">${input.reference}</span><br />
                        Date: ${formatDate(input.date)}
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0;font-size:16px;line-height:1.7;color:#23262E;">
                  <a href="${APP_URL}" style="color:#0F1B33;text-decoration:none;font-weight:600;">View your WimpyPay dashboard</a>
                </p>

                <p style="margin:12px 0 0;font-size:13px;line-height:1.7;color:#6E7480;">
                  This is an automated receipt. No reply is required.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function logEmailReceipt(
  userId: string,
  type: SendReceiptEmailInput['type'],
  reference: string,
  status: 'sent' | 'failed',
  errorMessage?: string | null
) {
  try {
    const serviceSupabase = createServiceSupabase();
    await serviceSupabase.from('email_receipts').insert({
      user_id: userId,
      type,
      transaction_reference: reference,
      sent_at: new Date().toISOString(),
      status,
      error_message: errorMessage,
    });
  } catch (logError) {
    console.error('Failed to log email receipt:', logError);
  }
}

export async function sendReceiptEmail(input: SendReceiptEmailInput) {
  const response = {
    status: 'sent' as 'sent' | 'failed',
    errorMessage: undefined as string | undefined,
  };

  if (!input.toEmail) {
    response.status = 'failed';
    response.errorMessage = 'Recipient email is missing';
    console.warn('Skipping receipt email because recipient email is missing for user', input.userId);
    await logEmailReceipt(input.userId, input.type, input.reference, response.status, response.errorMessage);
    return response;
  }

  if (!RESEND_API_KEY) {
    response.status = 'failed';
    response.errorMessage = 'Missing RESEND_API_KEY in environment';
    console.error(response.errorMessage);
    await logEmailReceipt(input.userId, input.type, input.reference, response.status, response.errorMessage);
    return response;
  }

  if (!FROM_EMAIL) {
    response.status = 'failed';
    response.errorMessage = 'Missing RESEND_FROM_EMAIL in environment';
    console.error(response.errorMessage);
    await logEmailReceipt(input.userId, input.type, input.reference, response.status, response.errorMessage);
    return response;
  }

  const amountLabel = formatAmount(input.amount, input.currency);
  const detailsHtml =
    input.type === 'wallet_funding'
      ? `<p style="margin:0 0 24px;font-size:20px;color:#C9A227;font-family:Georgia, 'Times New Roman', serif;">${amountLabel}</p>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#23262E;">Your wallet has been funded successfully.</p>
          <p style="margin:0 0 6px;font-size:14px;color:#23262E;"><strong>New wallet balance:</strong> ${formatAmount(input.balance ?? 0, input.currency)}</p>`
      : input.type === 'external_purchase'
        ? `<p style="margin:0 0 18px;font-size:16px;color:#23262E;line-height:1.7;">A purchase was charged to your wallet.</p>
            <p style="margin:0 0 8px;font-size:14px;color:#23262E;"><strong>Purchase:</strong> ${input.description || 'External purchase'}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#23262E;"><strong>Charged:</strong> ${amountLabel}</p>
            <p style="margin:0;font-size:14px;color:#23262E;"><strong>Remaining balance:</strong> ${formatAmount(input.balance ?? 0, input.currency)}</p>`
        : `<p style="margin:0 0 18px;font-size:16px;color:#23262E;line-height:1.7;">Your subscription is now active.</p>
            <p style="margin:0 0 8px;font-size:14px;color:#23262E;"><strong>Plan:</strong> ${input.planName || 'Subscription'}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#23262E;"><strong>Charged:</strong> ${amountLabel}</p>
            <p style="margin:0;font-size:14px;color:#23262E;"><strong>Next billing date:</strong> ${input.nextBillingDate ? formatDate(input.nextBillingDate) : 'N/A'}</p>`;

  const title = input.type === 'wallet_funding' ? 'Payment Received' : input.type === 'external_purchase' ? 'Purchase Charged' : 'Subscription Confirmed';
  const subtitle = input.type === 'wallet_funding' ? 'Your Wimpy Pay wallet has been funded' : input.type === 'external_purchase' ? 'Your wallet was charged for a purchase' : `Your ${input.planName || 'Subscription'} subscription is active`;
  const html = buildEmailHtml(input, title, subtitle, detailsHtml);
  const resend = new Resend(RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: input.toEmail,
      subject: subtitle,
      html,
    });
  } catch (error) {
    response.status = 'failed';
    response.errorMessage = error instanceof Error ? error.message : 'Email send failed';
    console.error('Resend email error:', error);
  }

  await logEmailReceipt(input.userId, input.type, input.reference, response.status, response.errorMessage ?? null);
  return response;
}
