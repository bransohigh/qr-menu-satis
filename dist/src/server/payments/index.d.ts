import { PaymentProvider } from './provider.interface';
/**
 * Returns the active PaymentProvider based on PAYMENT_PROVIDER env var.
 * Supported values: fakepay (default) | stripe | iyzico
 *
 * To add a new provider:
 *   1. Implement PaymentProvider in a new file
 *   2. Add a case here
 *   3. Set PAYMENT_PROVIDER=yourprovider in .env
 */
export declare function getPaymentProvider(): PaymentProvider;
export { PaymentProvider };
//# sourceMappingURL=index.d.ts.map