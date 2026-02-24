"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.panelRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../services/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../config/env");
exports.panelRouter = (0, express_1.Router)();
// ─── Multer (logo yüklemeleri) ────────────────────────────────────────────────
const uploadDir = path_1.default.isAbsolute(env_1.env.UPLOAD_DIR)
    ? env_1.env.UPLOAD_DIR
    : path_1.default.join(process.cwd(), env_1.env.UPLOAD_DIR);
const logoStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path_1.default.join(uploadDir, 'logos');
        fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `logo-${Date.now()}${ext}`);
    },
});
const logoUpload = (0, multer_1.default)({
    storage: logoStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ok = /^image\/(png|svg\+xml|jpeg|webp)$/.test(file.mimetype);
        cb(null, ok);
    },
});
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
// GET /panel/tasarimlar — Satın alınan temalarda aktif tema seçimi
exports.panelRouter.get('/tasarimlar', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await loadUserMenu(req.user.id);
    // Kullanıcının ödendi durumundaki satın alımları ve tema detayları
    const satinAlimlar = await prisma_1.prisma.purchase.findMany({
        where: { userId: req.user.id, status: 'paid' },
        include: { theme: true },
        orderBy: { createdAt: 'desc' },
    });
    res.render('panel/tasarimlar', {
        kullanici: req.user,
        menu,
        satinAlimlar,
        flash: req.query.flash || null,
    });
}));
// POST /panel/tasarim-sec — Aktif temayı güncelle
exports.panelRouter.post('/tasarim-sec', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { themeId } = req.body;
    if (!themeId) {
        res.redirect('/panel/tasarimlar?flash=hata-no-theme');
        return;
    }
    // Kullanıcının bu temayı satın aldığını doğrula
    const satin = await prisma_1.prisma.purchase.findFirst({
        where: { userId: req.user.id, themeId, status: 'paid' },
    });
    if (!satin) {
        res.redirect('/panel/tasarimlar?flash=hata-yetkisiz');
        return;
    }
    // Menü themeId güncelle
    await prisma_1.prisma.menu.update({
        where: { userId: req.user.id },
        data: { themeId },
    });
    res.redirect('/panel/tasarimlar?flash=basarili');
}));
// GET /panel/siparisler — Satın alım geçmişi
exports.panelRouter.get('/siparisler', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const satinAlimlar = await prisma_1.prisma.purchase.findMany({
        where: { userId: req.user.id },
        include: { theme: true },
        orderBy: { createdAt: 'desc' },
    });
    res.render('panel/siparisler', {
        kullanici: req.user,
        satinAlimlar,
        flash: req.query.flash || null,
    });
}));
// ─── API: Tasarım seçimi ─────────────────────────────────────────────────────
// GET /api/panel/tasarimlar
exports.panelRouter.get('/api/tasarimlar', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await prisma_1.prisma.menu.findUnique({
        where: { userId: req.user.id },
        select: { themeId: true },
    });
    const satinAlimlar = await prisma_1.prisma.purchase.findMany({
        where: { userId: req.user.id, status: 'paid' },
        include: { theme: true },
        orderBy: { createdAt: 'desc' },
    });
    res.json({
        aktifThemeId: menu?.themeId || null,
        satinAlinanTemalar: satinAlimlar.map((s) => ({
            purchaseId: s.id,
            themeId: s.themeId,
            temaAdi: s.theme.name,
            temaSlug: s.theme.slug,
            onizlemeFoto: s.theme.previewImage,
            aciklama: s.theme.description,
            satinAlinmaTarihi: s.createdAt,
        })),
    });
}));
// POST /api/panel/tasarim-sec
exports.panelRouter.post('/api/tasarim-sec', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { themeId } = req.body;
    if (!themeId) {
        res.status(400).json({ hata: 'themeId gerekli' });
        return;
    }
    const satin = await prisma_1.prisma.purchase.findFirst({
        where: { userId: req.user.id, themeId, status: 'paid' },
    });
    if (!satin) {
        res.status(403).json({ hata: 'Bu temayı satın almadınız.' });
        return;
    }
    const menu = await prisma_1.prisma.menu.update({
        where: { userId: req.user.id },
        data: { themeId },
        include: { theme: true },
    });
    res.json({ mesaj: 'Tasarım güncellendi.', aktifTema: menu.theme.name });
}));
// ─── GET /panel/marka — Marka kiti sayfası ────────────────────────────────────
exports.panelRouter.get('/marka', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await prisma_1.prisma.menu.findUnique({
        where: { userId: req.user.id },
        include: { theme: true },
    });
    if (!menu) {
        res.redirect('/temalar');
        return;
    }
    res.render('panel/marka', {
        kullanici: req.user,
        menu,
        brand: menu.brand ?? {},
        flash: req.query.flash || null,
    });
}));
// ─── GET /api/panel/marka — JSON ─────────────────────────────────────────────
exports.panelRouter.get('/api/marka', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await prisma_1.prisma.menu.findUnique({ where: { userId: req.user.id } });
    if (!menu) {
        res.status(404).json({ hata: 'Menü bulunamadı' });
        return;
    }
    res.json({ logoUrl: menu.logoUrl, brand: menu.brand });
}));
// ─── POST /api/panel/marka — Logo + renk güncelle ────────────────────────────
exports.panelRouter.post('/api/marka', logoUpload.single('logo'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    const { primaryColor, secondaryColor, accentColor } = req.body;
    const brand = {};
    if (primaryColor && hexRe.test(primaryColor))
        brand.primaryColor = primaryColor;
    if (secondaryColor && hexRe.test(secondaryColor))
        brand.secondaryColor = secondaryColor;
    if (accentColor && hexRe.test(accentColor))
        brand.accentColor = accentColor;
    const updateData = { brand };
    if (req.file) {
        updateData.logoUrl = `/uploads/logos/${req.file.filename}`;
    }
    await prisma_1.prisma.menu.update({
        where: { userId: req.user.id },
        data: updateData,
    });
    // form submit → redirect
    if (req.headers['content-type']?.includes('multipart/form-data') && !req.headers['accept']?.includes('json')) {
        res.redirect('/panel/marka?flash=kaydedildi');
        return;
    }
    res.json({ mesaj: 'Marka kiti güncellendi.' });
}));
//# sourceMappingURL=panel.js.map