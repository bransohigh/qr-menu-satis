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
export declare class IyzicoProvider implements PaymentProvider {
    createCheckout(purchaseId: string, _themeId: string, amount: number, _currency: string): Promise<CheckoutSession>;
    verifyWebhook(_rawBody: string, _signature: string): WebhookVerificationResult;
}
//# sourceMappingURL=iyzico.provider.d.ts.map