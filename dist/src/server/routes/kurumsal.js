"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kurumsalRouter = void 0;
const express_1 = require("express");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const sirket_1 = require("../config/sirket");
exports.kurumsalRouter = (0, express_1.Router)();
// Tüm sayfalar opsiyonel auth (nav için)
exports.kurumsalRouter.use(auth_1.optionalAuth);
// GET /hakkimizda
exports.kurumsalRouter.get('/hakkimizda', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.render('kurumsal/hakkimizda', {
        kullanici: req.user || null,
        sirket: sirket_1.sirket,
    });
}));
// GET /iletisim
exports.kurumsalRouter.get('/iletisim', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.render('kurumsal/iletisim', {
        kullanici: req.user || null,
        sirket: sirket_1.sirket,
        flash: req.query.flash || null,
    });
}));
// POST /iletisim — İletişim formu (basit: log + yönlendir)
exports.kurumsalRouter.post('/iletisim', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { ad, eposta, konu, mesaj } = req.body;
    // Gerçek uygulamada e-posta gönder (nodemailer vs.)
    console.log('[İletişim Formu]', { ad, eposta, konu, mesaj: mesaj?.slice(0, 200) });
    res.redirect('/iletisim?flash=gonderildi');
}));
// GET /gizlilik-politikasi
exports.kurumsalRouter.get('/gizlilik-politikasi', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.render('kurumsal/gizlilik', {
        kullanici: req.user || null,
        sirket: sirket_1.sirket,
        tarih: '24 Şubat 2026',
    });
}));
// GET /mesafeli-satis-sozlesmesi
exports.kurumsalRouter.get('/mesafeli-satis-sozlesmesi', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.render('kurumsal/mesafeli-satis', {
        kullanici: req.user || null,
        sirket: sirket_1.sirket,
        tarih: '24 Şubat 2026',
    });
}));
// GET /iptal-ve-iade
exports.kurumsalRouter.get('/iptal-ve-iade', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.render('kurumsal/iptal-iade', {
        kullanici: req.user || null,
        sirket: sirket_1.sirket,
        tarih: '24 Şubat 2026',
    });
}));
//# sourceMappingURL=kurumsal.js.map