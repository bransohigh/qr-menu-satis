"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../services/prisma");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const payments_1 = require("../payments");
function nanoid(n = 6) {
    const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let r = '';
    for (let i = 0; i < n; i++)
        r += c[Math.floor(Math.random() * c.length)];
    return r;
}
async function generateMenuSlug(businessName) {
    const base = businessName
        ? businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'menu'
        : 'menu';
    let slug = `${base}-${nanoid(6)}`;
    while (await prisma_1.prisma.menu.findUnique({ where: { slug } })) {
        slug = `${base}-${nanoid(6)}`;
    }
    return slug;
}
exports.checkoutRouter = (0, express_1.Router)();
// ── POST /api/checkout ── Create pending purchase → redirect to provider ───
exports.checkoutRouter.post('/', auth_1.requireAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { themeId } = req.body;
    if (!themeId)
        throw (0, errorHandler_1.createError)('themeId is required', 400);
    const theme = await prisma_1.prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme)
        throw (0, errorHandler_1.createError)('Theme not found', 404);
    // Check if user already has a paid purchase for any theme – MVP: one purchase = one menu
    const existingPaid = await prisma_1.prisma.purchase.findFirst({
        where: { userId: req.user.id, status: 'paid' },
    });
    if (existingPaid) {
        // Already paid – ensure menu exists and redirect to admin
        const menu = await prisma_1.prisma.menu.findUnique({ where: { userId: req.user.id } });
        if (!menu) {
            // Edge case: paid but no menu – create one now
            const slug = await generateMenuSlug();
            await prisma_1.prisma.menu.create({
                data: { userId: req.user.id, themeId, slug },
            });
        }
        res.json({ redirect: '/admin', message: 'You already have an active plan' });
        return;
    }
    const provider = (0, payments_1.getPaymentProvider)();
    const amount = Number(theme.price);
    const currency = theme.currency || 'USD';
    // Create pending purchase record
    const purchase = await prisma_1.prisma.purchase.create({
        data: {
            userId: req.user.id,
            themeId: theme.id,
            amount,
            currency,
            status: 'pending',
            provider: process.env.PAYMENT_PROVIDER || 'fakepay',
        },
    });
    // Get provider checkout session
    const session = await provider.createCheckout(purchase.id, theme.id, amount, currency);
    // Store providerRef (session ID) on the purchase
    await prisma_1.prisma.purchase.update({
        where: { id: purchase.id },
        data: { providerRef: session.sessionId },
    });
    res.json({ redirectUrl: session.redirectUrl, purchaseId: purchase.id });
}));
// ── POST /api/webhooks/payment ── Provider posts here on payment success ───
// Raw body access required to verify provider signatures.
exports.checkoutRouter.post('/webhook', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const rawBody = JSON.stringify(req.body); // FakePay just sends JSON
    const sig = req.headers['x-payment-signature'] || '';
    const provider = (0, payments_1.getPaymentProvider)();
    const result = provider.verifyWebhook(rawBody, sig);
    if (!result.valid) {
        res.status(400).json({ error: 'Invalid webhook signature' });
        return;
    }
    // purchaseId comes from the body (FakePay) or from verifyWebhook result (real providers)
    const purchaseId = req.body.purchaseId || result.purchaseId;
    if (!purchaseId) {
        res.status(400).json({ error: 'purchaseId missing' });
        return;
    }
    const purchase = await prisma_1.prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { theme: true },
    });
    if (!purchase) {
        res.status(404).json({ error: 'Purchase not found' });
        return;
    }
    if (purchase.status === 'paid') {
        res.json({ ok: true, message: 'Already paid' });
        return;
    }
    // Mark paid
    await prisma_1.prisma.purchase.update({
        where: { id: purchaseId },
        data: {
            status: 'paid',
            providerRef: result.providerRef || purchase.providerRef,
            updatedAt: new Date(),
        },
    });
    // Create Menu for user if not already exists
    const existingMenu = await prisma_1.prisma.menu.findUnique({ where: { userId: purchase.userId } });
    if (!existingMenu) {
        const slug = await generateMenuSlug();
        await prisma_1.prisma.menu.create({
            data: {
                userId: purchase.userId,
                themeId: purchase.themeId,
                slug,
            },
        });
    }
    console.log(`[payment] Purchase ${purchaseId} paid → menu created for user ${purchase.userId}`);
    res.json({ ok: true });
}));
// ── GET /checkout/success ──────────────────────────────────────────────────
exports.checkoutRouter.get('/success', auth_1.optionalAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const purchaseId = req.query.purchaseId;
    let purchase = null;
    if (purchaseId) {
        purchase = await prisma_1.prisma.purchase.findUnique({
            where: { id: purchaseId },
            include: { theme: true },
        });
    }
    res.render('checkout/success', { user: req.user || null, purchase });
}));
// ── GET /checkout/cancel ───────────────────────────────────────────────────
exports.checkoutRouter.get('/cancel', auth_1.optionalAuth, (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    res.render('checkout/cancel', { user: null });
}));
//# sourceMappingURL=checkout.js.map