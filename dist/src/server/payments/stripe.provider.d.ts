import { PaymentProvider, CheckoutSession, WebhookVerificationResult } from './provider.interface';
/**
 * Stripe payment provider (stub).
 *
 * To implement:
 * 1. npm install stripe
 * 2. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env
 * 3. Replace the stubs below with real Stripe SDK calls.
 *
 * @see https://stripe.com/docs/api/checkout/sessions/create
 */
export declare class StripeProvider implements PaymentProvider {
    createCheckout(purchaseId: string, _themeId: string, amount: number, currency: string): Promise<CheckoutSession>;
    verifyWebhook(rawBody: string, signature: string): WebhookVerificationResult;
}
//# sourceMappingURL=stripe.provider.d.ts.map