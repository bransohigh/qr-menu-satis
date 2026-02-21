"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.panelRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../services/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
exports.panelRouter = (0, express_1.Router)();
// Tüm panel rotaları kimlik doğrulama gerektiriyor
exports.panelRouter.use(auth_1.requireAuthHtml);
// Yardımcı: kullanıcının menüsünü yükle
async function loadUserMenu(userId) {
    return prisma_1.prisma.menu.findUnique({
        where: { userId },
        include: {
            theme: true,
            categories: { orderBy: { sortOrder: 'asc' } },
            products: { include: { category: true }, orderBy: { createdAt: 'asc' } },
        },
    });
}
// GET /panel - Müşteri paneli ana sayfası
exports.panelRouter.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await loadUserMenu(req.user.id);
    if (!menu) {
        res.redirect('/temalar');
        return;
    }
    const publicUrl = `${process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`}/m/${menu.slug}`;
    res.render('panel/dashboard', {
        kullanici: req.user,
        menu,
        publicUrl,
        urunSayisi: menu.products.length,
        kategoriSayisi: menu.categories.length,
    });
}));
// GET /panel/kategoriler
exports.panelRouter.get('/kategoriler', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await loadUserMenu(req.user.id);
    if (!menu) {
        res.redirect('/temalar');
        return;
    }
    res.render('panel/kategoriler', {
        kullanici: req.user,
        menu,
        kategoriler: menu.categories,
        flash: req.query.flash || null,
    });
}));
// GET /panel/urunler
exports.panelRouter.get('/urunler', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await loadUserMenu(req.user.id);
    if (!menu) {
        res.redirect('/temalar');
        return;
    }
    const seciliKategoriId = req.query.kategoriId || '';
    const filtrelenmisUrunler = seciliKategoriId
        ? menu.products.filter((p) => p.categoryId === seciliKategoriId)
        : menu.products;
    res.render('panel/urunler', {
        kullanici: req.user,
        menu,
        kategoriler: menu.categories,
        urunler: filtrelenmisUrunler,
        seciliKategoriId,
        flash: req.query.flash || null,
    });
}));
//# sourceMappingURL=panel.js.map