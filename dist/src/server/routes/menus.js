"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../services/prisma");
function nanoid(size = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < size; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}
const auth_1 = require("../middleware/auth");
const schemas_1 = require("../validators/schemas");
const errorHandler_1 = require("../middleware/errorHandler");
exports.menuRouter = (0, express_1.Router)();
// Helper: generate unique slug from businessName or random
async function generateSlug(businessName) {
    const base = businessName
        ? businessName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 30) || 'menu'
        : 'menu';
    let slug = `${base}-${nanoid(6)}`;
    // Ensure uniqueness
    while (await prisma_1.prisma.menu.findUnique({ where: { slug } })) {
        slug = `${base}-${nanoid(6)}`;
    }
    return slug;
}
// POST /api/menus/create-from-theme
// Creates a menu for the authenticated user with the selected theme.
exports.menuRouter.post('/create-from-theme', auth_1.requireAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const parsed = schemas_1.createMenuSchema.safeParse(req.body);
    if (!parsed.success) {
        throw (0, errorHandler_1.createError)('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }
    const { themeId, businessName } = parsed.data;
    // Check if user already has a menu
    const existingMenu = await prisma_1.prisma.menu.findUnique({ where: { userId: req.user.id } });
    if (existingMenu) {
        // Redirect to admin - user already has a menu
        res.json({ redirect: '/admin', message: 'You already have a menu' });
        return;
    }
    // Verify theme exists
    const theme = await prisma_1.prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme) {
        throw (0, errorHandler_1.createError)('Theme not found', 404);
    }
    const slug = await generateSlug(businessName);
    const menu = await prisma_1.prisma.menu.create({
        data: {
            userId: req.user.id,
            themeId,
            slug,
            businessName: businessName || null,
        },
        include: { theme: true },
    });
    res.status(201).json({ menu, redirect: '/admin' });
}));
//# sourceMappingURL=menus.js.map