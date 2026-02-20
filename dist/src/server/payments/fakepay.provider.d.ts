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
export declare class FakePayProvider implements PaymentProvider {
    createCheckout(purchaseId: string): Promise<CheckoutSession>;
    verifyWebhook(_rawBody: string, _signature: string): WebhookVerificationResult;
}
//# sourceMappingURL=fakepay.provider.d.ts.map