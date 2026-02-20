"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../services/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
exports.adminRouter = (0, express_1.Router)();
// All admin routes require HTML auth (redirects on failure)
exports.adminRouter.use(auth_1.requireAuthHtml);
// Helper: load user menu with full data
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
// GET /admin - Dashboard
exports.adminRouter.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await loadUserMenu(req.user.id);
    // If user has no menu, redirect to themes
    if (!menu) {
        res.redirect('/themes');
        return;
    }
    const publicUrl = `${process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`}/m/${menu.slug}`;
    res.render('admin/dashboard', {
        user: req.user,
        menu,
        publicUrl,
        productCount: menu.products.length,
        categoryCount: menu.categories.length,
    });
}));
// GET /admin/categories
exports.adminRouter.get('/categories', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await loadUserMenu(req.user.id);
    if (!menu) {
        res.redirect('/themes');
        return;
    }
    res.render('admin/categories', {
        user: req.user,
        menu,
        categories: menu.categories,
        flash: req.query.flash || null,
    });
}));
// GET /admin/products
exports.adminRouter.get('/products', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await loadUserMenu(req.user.id);
    if (!menu) {
        res.redirect('/themes');
        return;
    }
    const selectedCategoryId = req.query.categoryId || '';
    const filteredProducts = selectedCategoryId
        ? menu.products.filter((p) => p.categoryId === selectedCategoryId)
        : menu.products;
    res.render('admin/products', {
        user: req.user,
        menu,
        categories: menu.categories,
        products: filteredProducts,
        selectedCategoryId,
        flash: req.query.flash || null,
    });
}));
//# sourceMappingURL=admin.js.map