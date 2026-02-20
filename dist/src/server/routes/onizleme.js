"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onizlemeRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../services/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const demoMenuTR_1 = require("../data/demoMenuTR");
const temalar_1 = require("./temalar");
exports.onizlemeRouter = (0, express_1.Router)();
async function temaBul(slug) {
    return prisma_1.prisma.theme.findUnique({ where: { slug } });
}
// ── GET /onizleme/:temaSlug ────────────────────────────────────────────────
exports.onizlemeRouter.get('/:temaSlug', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const tema = await temaBul(req.params.temaSlug);
    if (!tema) {
        res.status(404).render('hata/404', { baslik: 'Tema Bulunamadı', mesaj: 'Aradığınız tema mevcut değil.' });
        return;
    }
    const konfig = (0, temalar_1.getTemaKonfig)(tema.templateKey);
    const menu = (0, demoMenuTR_1.buildDemoMenuTR)(tema.slug, tema.name);
    const urunlerKategoriye = {};
    for (const kat of demoMenuTR_1.DEMO_KATEGORILER) {
        urunlerKategoriye[kat.id] = demoMenuTR_1.DEMO_URUNLER.filter(u => u.categoryId === kat.id);
    }
    res.render('onizleme/ana', {
        tema, konfig, menu,
        kategoriler: demoMenuTR_1.DEMO_KATEGORILER,
        urunlerKategoriye,
        baseUrl: `/onizleme/${tema.slug}`,
        baslik: `Önizleme: ${tema.name}`,
    });
}));
// ── GET /onizleme/:temaSlug/k/:kategoriSlug ────────────────────────────────
exports.onizlemeRouter.get('/:temaSlug/k/:kategoriSlug', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const tema = await temaBul(req.params.temaSlug);
    if (!tema) {
        res.status(404).render('hata/404', { baslik: 'Tema Bulunamadı', mesaj: '' });
        return;
    }
    const kategori = demoMenuTR_1.DEMO_KATEGORILER.find(k => k.slug === req.params.kategoriSlug);
    if (!kategori) {
        res.status(404).render('hata/404', { baslik: 'Kategori Bulunamadı', mesaj: '' });
        return;
    }
    const konfig = (0, temalar_1.getTemaKonfig)(tema.templateKey);
    const menu = (0, demoMenuTR_1.buildDemoMenuTR)(tema.slug, tema.name);
    const urunler = demoMenuTR_1.DEMO_URUNLER.filter(u => u.categoryId === kategori.id);
    res.render('onizleme/kategori', {
        tema, konfig, menu, kategori,
        kategoriler: demoMenuTR_1.DEMO_KATEGORILER,
        urunler,
        baseUrl: `/onizleme/${tema.slug}`,
        baslik: `${kategori.name} — ${tema.name} Önizleme`,
    });
}));
// ── GET /onizleme/:temaSlug/u/:urunSlug ───────────────────────────────────
exports.onizlemeRouter.get('/:temaSlug/u/:urunSlug', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const tema = await temaBul(req.params.temaSlug);
    if (!tema) {
        res.status(404).render('hata/404', { baslik: 'Tema Bulunamadı', mesaj: '' });
        return;
    }
    const urun = demoMenuTR_1.DEMO_URUNLER.find(u => u.slug === req.params.urunSlug);
    if (!urun) {
        res.status(404).render('hata/404', { baslik: 'Ürün Bulunamadı', mesaj: '' });
        return;
    }
    const konfig = (0, temalar_1.getTemaKonfig)(tema.templateKey);
    const menu = (0, demoMenuTR_1.buildDemoMenuTR)(tema.slug, tema.name);
    const kategori = demoMenuTR_1.DEMO_KATEGORILER.find(k => k.id === urun.categoryId);
    const kategoriUrunleri = demoMenuTR_1.DEMO_URUNLER.filter(u => u.categoryId === urun.categoryId && u.id !== urun.id).slice(0, 4);
    res.render('onizleme/urun', {
        tema, konfig, menu, urun, kategori, kategoriUrunleri,
        kategoriler: demoMenuTR_1.DEMO_KATEGORILER,
        baseUrl: `/onizleme/${tema.slug}`,
        baslik: `${urun.name} — ${tema.name} Önizleme`,
    });
}));
//# sourceMappingURL=onizleme.js.map