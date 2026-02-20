"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.odemeRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../services/prisma");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
exports.odemeRouter = (0, express_1.Router)();
function nanoid(n = 6) {
    const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let r = '';
    for (let i = 0; i < n; i++)
        r += c[Math.floor(Math.random() * c.length)];
    return r;
}
async function menuSlugUret(isletmeAdi) {
    const taban = isletmeAdi
        ? isletmeAdi.toLowerCase()
            .replace(/[^a-z0-9çğışöüÇĞİŞÖÜ]/gi, '-')
            .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ışİŞ]/g, 'is')
            .replace(/[öÖ]/g, 'o').replace(/[üÜ]/g, 'u')
            .replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'menu'
        : 'menu';
    let slug = `${taban}-${nanoid(6)}`;
    while (await prisma_1.prisma.menu.findUnique({ where: { slug } })) {
        slug = `${taban}-${nanoid(6)}`;
    }
    return slug;
}
// ── GET /odeme/simule?temaId=... ────────────────────────────────────────────
exports.odemeRouter.get('/simule', auth_1.optionalAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { temaId, temaSlug } = req.query;
    let tema = null;
    if (temaId) {
        tema = await prisma_1.prisma.theme.findUnique({ where: { id: temaId } });
    }
    else if (temaSlug) {
        tema = await prisma_1.prisma.theme.findUnique({ where: { slug: temaSlug } });
    }
    if (!tema)
        throw (0, errorHandler_1.createError)('Tema bulunamadı', 404);
    res.render('odeme/simule', {
        tema,
        kullanici: req.user || null,
    });
}));
// ── POST /odeme/tamamla ─────────────────────────────────────────────────────
exports.odemeRouter.post('/tamamla', auth_1.requireAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { temaId, isletmeAdi, iptal } = req.body;
    if (iptal === '1') {
        return res.redirect('/temalar?flash=iptal');
    }
    if (!temaId)
        throw (0, errorHandler_1.createError)('Tema ID gerekli', 400);
    const tema = await prisma_1.prisma.theme.findUnique({ where: { id: temaId } });
    if (!tema)
        throw (0, errorHandler_1.createError)('Tema bulunamadı', 404);
    // Mevcut ödeme var mı?
    const mevcutOdeme = await prisma_1.prisma.purchase.findFirst({
        where: { userId: req.user.id, status: 'paid' },
    });
    let purchase;
    if (mevcutOdeme) {
        purchase = mevcutOdeme;
    }
    else {
        purchase = await prisma_1.prisma.purchase.create({
            data: {
                userId: req.user.id,
                themeId: tema.id,
                amount: Number(tema.price),
                currency: tema.currency || 'TRY',
                status: 'paid',
                provider: 'simule',
                providerRef: `sim_${nanoid(12)}`,
            },
        });
    }
    // Kullanıcı menüsü oluştur (yoksa)
    const mevcutMenu = await prisma_1.prisma.menu.findUnique({ where: { userId: req.user.id } });
    if (!mevcutMenu) {
        const slug = await menuSlugUret(isletmeAdi);
        await prisma_1.prisma.menu.create({
            data: {
                userId: req.user.id,
                themeId: tema.id,
                slug,
                businessName: isletmeAdi || 'İşletmem',
            },
        });
    }
    res.redirect(`/odeme/basari?satinAlimId=${purchase.id}`);
}));
// ── GET /odeme/basari ───────────────────────────────────────────────────────
exports.odemeRouter.get('/basari', auth_1.optionalAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { satinAlimId } = req.query;
    let satinAlim = null;
    if (satinAlimId) {
        satinAlim = await prisma_1.prisma.purchase.findUnique({
            where: { id: satinAlimId },
            include: { theme: true },
        });
    }
    res.render('odeme/basari', {
        kullanici: req.user || null,
        satinAlim,
    });
}));
// ── GET /odeme/iptal ────────────────────────────────────────────────────────
exports.odemeRouter.get('/iptal', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    res.render('odeme/iptal', {});
}));
//# sourceMappingURL=odeme.js.map