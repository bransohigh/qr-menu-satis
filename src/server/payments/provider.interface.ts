/**
 * PaymentProvider interface.
 * Implement this to add a new payment provider (Stripe, Iyzico, etc.).
 */

export interface CheckoutSession {
  /** Provider-specific session/order ID */
  sessionId: string;
  /** URL to redirect the user to complete payment */
  redirectUrl: string;
}

export interface WebhookVerificationResult {
  valid: boolean;
  purchaseId?: string;
  providerRef?: string;
}

export interface PaymentProvider {
  /**
   * Create a checkout session for a pending purchase.
   * @returns CheckoutSession with redirectUrl to send the user to
   */
  createCheckout(
    purchaseId: string,
    themeId: string,
    amount: number,
    currency: string,
  ): Promise<CheckoutSession>;

  /**
   * Verify an incoming webhook payload.
   * Return the purchaseId and providerRef if valid.
   */
  verifyWebhook(rawBody: string, signature: string): WebhookVerificationResult;
}
