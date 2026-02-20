"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentProvider = getPaymentProvider;
const fakepay_provider_1 = require("./fakepay.provider");
const stripe_provider_1 = require("./stripe.provider");
const iyzico_provider_1 = require("./iyzico.provider");
/**
 * Returns the active PaymentProvider based on PAYMENT_PROVIDER env var.
 * Supported values: fakepay (default) | stripe | iyzico
 *
 * To add a new provider:
 *   1. Implement PaymentProvider in a new file
 *   2. Add a case here
 *   3. Set PAYMENT_PROVIDER=yourprovider in .env
 */
function getPaymentProvider() {
    const name = (process.env.PAYMENT_PROVIDER || 'fakepay').toLowerCase();
    switch (name) {
        case 'stripe': return new stripe_provider_1.StripeProvider();
        case 'iyzico': return new iyzico_provider_1.IyzicoProvider();
        case 'fakepay':
        default: return new fakepay_provider_1.FakePayProvider();
    }
}
//# sourceMappingURL=index.js.map