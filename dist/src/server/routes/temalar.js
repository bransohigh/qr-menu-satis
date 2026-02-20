"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.temalarRouter = void 0;
exports.getTemaKonfig = getTemaKonfig;
const express_1 = require("express");
const prisma_1 = require("../services/prisma");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
exports.temalarRouter = (0, express_1.Router)();
// ─── Yardımcı: Tema konfigürasyonu ──────────────────────────────────────────
function getTemaKonfig(templateKey) {
    const configs = {
        tema_01: { duzen: 'klasik-liste', koyuMod: false, vurgRenk: 'slate', aciklama: 'Temiz ve okunması kolay klasik liste düzeni' },
        tema_02: { duzen: 'kart-duzen', koyuMod: false, vurgRenk: 'violet', aciklama: 'Görsel ağırlıklı büyük kart grid yapısı' },
        tema_03: { duzen: 'minimal', koyuMod: false, vurgRenk: 'stone', aciklama: 'Çok boşluk ve büyük tipografi odaklı minimal tasarım' },
        tema_04: { duzen: 'gece-modu', koyuMod: true, vurgRenk: 'cyan', aciklama: 'Neon vurgulu göz dostu koyu tema' },
        tema_05: { duzen: 'kapakli', koyuMod: false, vurgRenk: 'amber', aciklama: 'Büyük hero alanı ve sekmeli kategori gezintisi' },
        tema_06: { duzen: 'sol-menu', koyuMod: false, vurgRenk: 'emerald', aciklama: 'Desktop\'ta sol panel kategori navigasyonu' },
        tema_07: { duzen: 'kategori-seridi', koyuMod: false, vurgRenk: 'rose', aciklama: 'Üstte yapışkan kayar kategori çubuğu' },
        tema_08: { duzen: 'gorsel-odakli', koyuMod: false, vurgRenk: 'orange', aciklama: 'Ürün fotoğrafı ana alan, içerik alt üstte' },
        tema_09: { duzen: 'kompakt', koyuMod: false, vurgRenk: 'teal', aciklama: 'Fiyat sağda, yoğun ve hızlı taranabilen liste' },
        tema_10: { duzen: 'premium', koyuMod: true, vurgRenk: 'purple', aciklama: 'Cam efekti (glassmorphism) ve yumuşak animasyonlar' },
    };
    return configs[templateKey] || configs['tema_01'];
}
// ─── GET /temalar ─────────────────────────────────────────────────────────────
exports.temalarRouter.get('/', auth_1.optionalAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const temalar = await prisma_1.prisma.theme.findMany({ orderBy: { createdAt: 'asc' } });
    let kullaniciMenusu = null;
    if (req.user) {
        kullaniciMenusu = await prisma_1.prisma.menu.findUnique({ where: { userId: req.user.id } });
    }
    res.render('temalar/index', {
        temalar,
        kullanici: req.user || null,
        kullaniciMenusu,
        getTemaKonfig,
        flash: req.query.flash || null,
    });
}));
// ─── GET /temalar/:temaSlug ───────────────────────────────────────────────────
exports.temalarRouter.get('/:temaSlug', auth_1.optionalAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { temaSlug } = req.params;
    const tema = await prisma_1.prisma.theme.findUnique({ where: { slug: temaSlug } });
    if (!tema)
        throw (0, errorHandler_1.createError)('Tema bulunamadı', 404);
    const konfig = getTemaKonfig(tema.templateKey);
    let satin_alindi = false;
    if (req.user) {
        const satin_alim = await prisma_1.prisma.purchase.findFirst({
            where: { userId: req.user.id, status: 'paid' },
        });
        satin_alindi = !!satin_alim;
    }
    res.render('temalar/detay', {
        tema,
        konfig,
        kullanici: req.user || null,
        satin_alindi,
    });
}));
//# sourceMappingURL=temalar.js.map