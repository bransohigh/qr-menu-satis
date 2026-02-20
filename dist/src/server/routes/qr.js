"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrRouter = void 0;
const express_1 = require("express");
const qrcode_1 = __importDefault(require("qrcode"));
const prisma_1 = require("../services/prisma");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
exports.qrRouter = (0, express_1.Router)();
// GET /api/qr - Generate QR code PNG for the authenticated user's menu
exports.qrRouter.get('/', auth_1.requireAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await prisma_1.prisma.menu.findUnique({ where: { userId: req.user.id } });
    if (!menu)
        throw (0, errorHandler_1.createError)('No menu found', 404);
    const publicUrl = `${process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`}/m/${menu.slug}`;
    const qrBuffer = await qrcode_1.default.toBuffer(publicUrl, {
        type: 'png',
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-${menu.slug}.png"`);
    res.send(qrBuffer);
}));
//# sourceMappingURL=qr.js.map