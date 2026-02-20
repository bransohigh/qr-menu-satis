"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakepayRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../services/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
exports.fakepayRouter = (0, express_1.Router)();
// ── GET /pay/fake?purchaseId=... ───────────────────────────────────────────
exports.fakepayRouter.get('/fake', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { purchaseId } = req.query;
    if (!purchaseId)
        throw (0, errorHandler_1.createError)('Missing purchaseId', 400);
    const purchase = await prisma_1.prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { theme: true, user: true },
    });
    if (!purchase)
        throw (0, errorHandler_1.createError)('Purchase not found', 404);
    if (purchase.status === 'paid') {
        return res.redirect('/admin');
    }
    res.render('pay/fake', {
        purchase,
        theme: purchase.theme,
        user: purchase.user,
    });
}));
// ── POST /pay/fake/confirm ─────────────────────────────────────────────────
exports.fakepayRouter.post('/fake/confirm', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { purchaseId, action } = req.body;
    if (!purchaseId)
        throw (0, errorHandler_1.createError)('Missing purchaseId', 400);
    const purchase = await prisma_1.prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { theme: true },
    });
    if (!purchase)
        throw (0, errorHandler_1.createError)('Purchase not found', 404);
    if (action === 'cancel') {
        await prisma_1.prisma.purchase.update({
            where: { id: purchaseId },
            data: { status: 'failed', updatedAt: new Date() },
        });
        return res.redirect('/checkout/cancel');
    }
    // Simulate payment success – call our own webhook internally
    if (purchase.status !== 'paid') {
        // Mark paid
        await prisma_1.prisma.purchase.update({
            where: { id: purchaseId },
            data: {
                status: 'paid',
                providerRef: `fake_${purchaseId}`,
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
        console.log(`[fakepay] Purchase ${purchaseId} confirmed → menu ensured for user ${purchase.userId}`);
    }
    res.redirect(`/checkout/success?purchaseId=${purchaseId}`);
}));
// ─── helpers ──────────────────────────────────────────────────────────────
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
//# sourceMappingURL=fakepay.js.map