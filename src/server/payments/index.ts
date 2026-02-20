import { PaymentProvider } from './provider.interface';
import { FakePayProvider } from './fakepay.provider';
import { StripeProvider } from './stripe.provider';
import { IyzicoProvider } from './iyzico.provider';

/**
 * Returns the active PaymentProvider based on PAYMENT_PROVIDER env var.
 * Supported values: fakepay (default) | stripe | iyzico
 *
 * To add a new provider:
 *   1. Implement PaymentProvider in a new file
 *   2. Add a case here
 *   3. Set PAYMENT_PROVIDER=yourprovider in .env
 */
export function getPaymentProvider(): PaymentProvider {
  const name = (process.env.PAYMENT_PROVIDER || 'fakepay').toLowerCase();
  switch (name) {
    case 'stripe':  return new StripeProvider();
    case 'iyzico':  return new IyzicoProvider();
    case 'fakepay':
    default:        return new FakePayProvider();
  }
}

export { PaymentProvider };
