"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IyzicoProvider = void 0;
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
class IyzicoProvider {
    async createCheckout(purchaseId, _themeId, amount, _currency) {
        // const Iyzipay = require('iyzipay');
        // const iyzipay = new Iyzipay({ apiKey: process.env.IYZICO_API_KEY, secretKey: process.env.IYZICO_SECRET_KEY, uri: process.env.IYZICO_BASE_URL });
        // ... create checkout form request ...
        throw new Error('iyzico provider not configured. Set PAYMENT_PROVIDER=fakepay or provide iyzico credentials.');
    }
    verifyWebhook(_rawBody, _signature) {
        throw new Error('iyzico webhook verification not implemented.');
    }
}
exports.IyzicoProvider = IyzicoProvider;
//# sourceMappingURL=iyzico.provider.js.map