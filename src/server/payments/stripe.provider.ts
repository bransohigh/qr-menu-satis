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
export class StripeProvider implements PaymentProvider {
  async createCheckout(
    purchaseId: string,
    _themeId: string,
    amount: number,
    currency: string,
  ): Promise<CheckoutSession> {
    // Example real implementation:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'payment',
    //   payment_method_types: ['card'],
    //   line_items: [{ price_data: { currency, unit_amount: Math.round(amount * 100), product_data: { name: 'QR Menu Theme' } }, quantity: 1 }],
    //   metadata: { purchaseId },
    //   success_url: `${process.env.PUBLIC_URL}/checkout/success?purchaseId=${purchaseId}`,
    //   cancel_url:  `${process.env.PUBLIC_URL}/checkout/cancel`,
    // });
    // return { sessionId: session.id, redirectUrl: session.url! };
    throw new Error(
      'Stripe provider not configured. Set PAYMENT_PROVIDER=fakepay or provide STRIPE_SECRET_KEY.',
    );
  }

  verifyWebhook(rawBody: string, signature: string): WebhookVerificationResult {
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
    // const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    // const session = event.data.object as Stripe.Checkout.Session;
    // return { valid: true, purchaseId: session.metadata?.purchaseId, providerRef: session.payment_intent as string };
    throw new Error('Stripe webhook verification not implemented.');
  }
}
