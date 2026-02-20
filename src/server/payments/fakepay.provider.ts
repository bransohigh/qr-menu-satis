import { PaymentProvider, CheckoutSession, WebhookVerificationResult } from './provider.interface';

/**
 * FakePay – local development payment provider.
 *
 * Simulates a complete purchase flow with no external dependencies:
 *   1. createCheckout()  -> redirects to GET /pay/fake?purchaseId=...
 *   2. User clicks "Pay Now" on that page
 *   3. POST /pay/fake/confirm  marks purchase paid and creates the menu
 *
 * No real money is ever charged.
 */
export class FakePayProvider implements PaymentProvider {
  async createCheckout(purchaseId: string): Promise<CheckoutSession> {
    return {
      sessionId: purchaseId,
      redirectUrl: `/pay/fake?purchaseId=${purchaseId}`,
    };
  }

  verifyWebhook(_rawBody: string, _signature: string): WebhookVerificationResult {
    // FakePay signs nothing – always valid in dev
    return { valid: true };
  }
}
