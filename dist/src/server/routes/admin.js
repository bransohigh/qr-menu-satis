"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
exports.adminRouter = (0, express_1.Router)();
// /admin/* - Geriye dönük uyumluluk: role göre yönlendir
exports.adminRouter.use(auth_1.requireAuthHtml, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user?.role === 'ADMIN') {
        res.redirect('/yonetim');
    }
    else {
        res.redirect('/panel');
    }
}));
//# sourceMappingURL=admin.js.map