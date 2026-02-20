import { PaymentProvider, CheckoutSession, WebhookVerificationResult } from './provider.interface';

/**
 * iyzico payment provider (stub).
 *
 * To implement:
 * 1. npm install iyzipay
 * 2. Set IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL in .env
 * 3. Replace stubs with real iyzipay SDK calls.
 *
 * @see https://dev.iyzipay.com
 */
export class IyzicoProvider implements PaymentProvider {
  async createCheckout(
    purchaseId: string,
    _themeId: string,
    amount: number,
    _currency: string,
  ): Promise<CheckoutSession> {
    // const Iyzipay = require('iyzipay');
    // const iyzipay = new Iyzipay({ apiKey: process.env.IYZICO_API_KEY, secretKey: process.env.IYZICO_SECRET_KEY, uri: process.env.IYZICO_BASE_URL });
    // ... create checkout form request ...
    throw new Error(
      'iyzico provider not configured. Set PAYMENT_PROVIDER=fakepay or provide iyzico credentials.',
    );
  }

  verifyWebhook(_rawBody: string, _signature: string): WebhookVerificationResult {
    throw new Error('iyzico webhook verification not implemented.');
  }
}
