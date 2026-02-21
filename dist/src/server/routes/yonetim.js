"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yonetimRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../services/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
exports.yonetimRouter = (0, express_1.Router)();
// Tüm yönetim rotaları ADMIN yetkisi gerektiriyor
exports.yonetimRouter.use(auth_1.requireAdminHtml);
// GET /yonetim - Süper admin ana sayfası
exports.yonetimRouter.get('/', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const [toplamKullanici, toplamMenu, toplamSatinAlim] = await Promise.all([
        prisma_1.prisma.user.count(),
        prisma_1.prisma.menu.count(),
        prisma_1.prisma.purchase.count(),
    ]);
    const yediGunOnce = new Date();
    yediGunOnce.setDate(yediGunOnce.getDate() - 7);
    const sonYediGunSatinAlim = await prisma_1.prisma.purchase.count({
        where: { createdAt: { gte: yediGunOnce } },
    });
    const sonSatinAlimlar = await prisma_1.prisma.purchase.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { email: true } },
            theme: { select: { name: true } },
        },
    });
    res.render('yonetim/dashboard', {
        kullanici: _req.user,
        toplamKullanici,
        toplamMenu,
        toplamSatinAlim,
        sonYediGunSatinAlim,
        sonSatinAlimlar,
    });
}));
// GET /yonetim/satin-alimlar
exports.yonetimRouter.get('/satin-alimlar', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const sayfa = parseInt(req.query.sayfa || '1', 10);
    const limit = 50;
    const atla = (sayfa - 1) * limit;
    const [satinAlimlar, toplamSayı] = await Promise.all([
        prisma_1.prisma.purchase.findMany({
            take: limit,
            skip: atla,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { email: true } },
                theme: { select: { name: true } },
            },
        }),
        prisma_1.prisma.purchase.count(),
    ]);
    res.render('yonetim/satin-alimlar', {
        kullanici: req.user,
        satinAlimlar,
        toplamSayı,
        sayfa,
        toplamSayfa: Math.ceil(toplamSayı / limit),
    });
}));
// GET /yonetim/satin-alimlar/:id
exports.yonetimRouter.get('/satin-alimlar/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const satinAlim = await prisma_1.prisma.purchase.findUnique({
        where: { id: req.params.id },
        include: {
            user: { select: { email: true, id: true } },
            theme: true,
        },
    });
    if (!satinAlim) {
        res.status(404).render('hata/404', { mesaj: 'Satın alım bulunamadı' });
        return;
    }
    res.render('yonetim/satin-alim-detay', {
        kullanici: req.user,
        satinAlim,
    });
}));
// POST /yonetim/satin-alimlar/:id/durum - FakePay durumu güncelle
exports.yonetimRouter.post('/satin-alimlar/:id/durum', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { durum } = req.body;
    const gecerliDurumlar = ['pending', 'paid', 'failed', 'refunded'];
    if (!gecerliDurumlar.includes(durum)) {
        res.status(400).json({ error: 'Geçersiz durum' });
        return;
    }
    await prisma_1.prisma.purchase.update({
        where: { id: req.params.id },
        data: { status: durum },
    });
    res.redirect(`/yonetim/satin-alimlar/${req.params.id}?flash=guncellendi`);
}));
// GET /yonetim/menuler
exports.yonetimRouter.get('/menuler', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const arama = req.query.arama || '';
    const sayfa = parseInt(req.query.sayfa || '1', 10);
    const limit = 50;
    const atla = (sayfa - 1) * limit;
    const where = arama
        ? {
            OR: [
                { businessName: { contains: arama, mode: 'insensitive' } },
                { user: { email: { contains: arama, mode: 'insensitive' } } },
            ],
        }
        : {};
    const [menuler, toplamSayi] = await Promise.all([
        prisma_1.prisma.menu.findMany({
            where,
            take: limit,
            skip: atla,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { email: true } },
                theme: { select: { name: true } },
                _count: { select: { categories: true, products: true } },
            },
        }),
        prisma_1.prisma.menu.count({ where }),
    ]);
    res.render('yonetim/menuler', {
        kullanici: req.user,
        menuler,
        toplamSayi,
        sayfa,
        toplamSayfa: Math.ceil(toplamSayi / limit),
        arama,
    });
}));
// GET /yonetim/menuler/:menuId - Menü düzenleme (admin olarak)
exports.yonetimRouter.get('/menuler/:menuId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await prisma_1.prisma.menu.findUnique({
        where: { id: req.params.menuId },
        include: {
            user: { select: { email: true } },
            theme: true,
            categories: { orderBy: { sortOrder: 'asc' } },
            products: { include: { category: true }, orderBy: { createdAt: 'asc' } },
        },
    });
    if (!menu) {
        res.status(404).render('hata/404', { mesaj: 'Menü bulunamadı' });
        return;
    }
    const seciliKategoriId = req.query.kategoriId || '';
    const filtrelenmisUrunler = seciliKategoriId
        ? menu.products.filter((p) => p.categoryId === seciliKategoriId)
        : menu.products;
    res.render('yonetim/menu-duzenle', {
        kullanici: req.user,
        menu,
        kategoriler: menu.categories,
        urunler: filtrelenmisUrunler,
        seciliKategoriId,
        flash: req.query.flash || null,
    });
}));
// GET /yonetim/kullanicilar
exports.yonetimRouter.get('/kullanicilar', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const arama = req.query.arama || '';
    const sayfa = parseInt(req.query.sayfa || '1', 10);
    const limit = 50;
    const atla = (sayfa - 1) * limit;
    const where = arama
        ? { email: { contains: arama, mode: 'insensitive' } }
        : {};
    const [kullanicilar, toplamSayi] = await Promise.all([
        prisma_1.prisma.user.findMany({
            where,
            take: limit,
            skip: atla,
            orderBy: { createdAt: 'desc' },
            include: {
                menu: { select: { id: true, slug: true, businessName: true } },
                purchases: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { createdAt: true, status: true },
                },
            },
        }),
        prisma_1.prisma.user.count({ where }),
    ]);
    res.render('yonetim/kullanicilar', {
        kullanici: req.user,
        kullanicilar,
        toplamSayi,
        sayfa,
        toplamSayfa: Math.ceil(toplamSayi / limit),
        arama,
    });
}));
// GET /yonetim/kullanicilar/:userId
exports.yonetimRouter.get('/kullanicilar/:userId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const hedefKullanici = await prisma_1.prisma.user.findUnique({
        where: { id: req.params.userId },
        include: {
            menu: {
                include: {
                    theme: true,
                    _count: { select: { categories: true, products: true } },
                },
            },
            purchases: {
                orderBy: { createdAt: 'desc' },
                include: { theme: { select: { name: true } } },
            },
        },
    });
    if (!hedefKullanici) {
        res.status(404).render('hata/404', { mesaj: 'Kullanıcı bulunamadı' });
        return;
    }
    res.render('yonetim/kullanici-detay', {
        kullanici: req.user,
        hedefKullanici,
        flash: req.query.flash || null,
    });
}));
// POST /yonetim/kullanicilar/:userId/rol - Kullanıcı rolünü değiştir
exports.yonetimRouter.post('/kullanicilar/:userId/rol', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { rol } = req.body;
    if (rol !== 'MUSTERI' && rol !== 'ADMIN') {
        res.status(400).json({ error: 'Geçersiz rol' });
        return;
    }
    // Kendi rolünü değiştirmeyi engelle
    if (req.params.userId === req.user.id) {
        res.redirect(`/yonetim/kullanicilar/${req.params.userId}?flash=kendi-rol`);
        return;
    }
    await prisma_1.prisma.user.update({
        where: { id: req.params.userId },
        data: { role: rol },
    });
    res.redirect(`/yonetim/kullanicilar/${req.params.userId}?flash=rol-guncellendi`);
}));
//# sourceMappingURL=yonetim.js.map