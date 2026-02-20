"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakePayProvider = void 0;
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
class FakePayProvider {
    async createCheckout(purchaseId) {
        return {
            sessionId: purchaseId,
            redirectUrl: `/pay/fake?purchaseId=${purchaseId}`,
        };
    }
    verifyWebhook(_rawBody, _signature) {
        // FakePay signs nothing – always valid in dev
        return { valid: true };
    }
}
exports.FakePayProvider = FakePayProvider;
//# sourceMappingURL=fakepay.provider.js.map