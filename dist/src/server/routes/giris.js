"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.girisRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
exports.girisRouter = (0, express_1.Router)();
// GET /giris - Giriş/Kayıt sayfası
exports.girisRouter.get('/', auth_1.optionalAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Zaten giriş yapmışsa yönlendir
    if (req.user) {
        if (req.user.role === 'ADMIN') {
            res.redirect('/yonetim');
        }
        else {
            res.redirect('/panel');
        }
        return;
    }
    const sonra = req.query.sonra || '';
    res.render('giris/index', {
        sonra,
        hata: req.query.hata || null,
    });
}));
//# sourceMappingURL=giris.js.map