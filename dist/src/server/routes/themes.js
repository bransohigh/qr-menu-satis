"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.themeRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../services/prisma");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
exports.themeRouter = (0, express_1.Router)();
// GET /themes/api/list - JSON list of all themes (for test scripts, future SPA use)
exports.themeRouter.get('/api/list', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const themes = await prisma_1.prisma.theme.findMany({ orderBy: { createdAt: 'asc' } });
    res.json({ themes });
}));
exports.themeRouter.get('/', auth_1.optionalAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const themes = await prisma_1.prisma.theme.findMany({ orderBy: { createdAt: 'asc' } });
    // Check if user already has a menu
    let userMenu = null;
    if (req.user) {
        userMenu = await prisma_1.prisma.menu.findUnique({ where: { userId: req.user.id } });
    }
    const redirectAfter = req.query.redirect || '/admin';
    res.render('themes/index', {
        themes,
        user: req.user || null,
        userMenu,
        redirectAfter,
        flash: req.query.flash || null,
    });
}));
// GET /themes/:themeSlug — theme detail / marketing page
exports.themeRouter.get('/:themeSlug', auth_1.optionalAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { themeSlug } = req.params;
    const theme = await prisma_1.prisma.theme.findUnique({ where: { slug: themeSlug } });
    if (!theme)
        throw (0, errorHandler_1.createError)('Theme not found', 404);
    let hasPurchased = false;
    if (req.user) {
        const purchase = await prisma_1.prisma.purchase.findFirst({
            where: { userId: req.user.id, status: 'paid' },
        });
        hasPurchased = !!purchase;
    }
    res.render('themes/detail', {
        theme,
        user: req.user || null,
        hasPurchased,
    });
}));
//# sourceMappingURL=themes.js.map