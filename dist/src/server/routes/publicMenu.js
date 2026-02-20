"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicMenuRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../services/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
exports.publicMenuRouter = (0, express_1.Router)();
// Shared: load a menu by slug with categories and products
async function loadMenu(slug) {
    return prisma_1.prisma.menu.findUnique({
        where: { slug },
        include: {
            theme: true,
            categories: { orderBy: { sortOrder: 'asc' } },
            products: {
                include: { category: true },
                orderBy: { createdAt: 'asc' },
            },
        },
    });
}
// GET /m/:slug — Menu home page
exports.publicMenuRouter.get('/:slug', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await loadMenu(req.params.slug);
    if (!menu) {
        res.status(404).render('menu/404', { title: 'Menu Not Found' });
        return;
    }
    const productsByCategory = {};
    for (const cat of menu.categories) {
        productsByCategory[cat.id] = menu.products.filter((p) => p.categoryId === cat.id);
    }
    res.render('menu/home', {
        menu,
        categories: menu.categories,
        productsByCategory,
        baseUrl: `/m/${menu.slug}`,
        title: menu.businessName || 'Menu',
    });
}));
// GET /m/:slug/c/:categorySlug — Category page
exports.publicMenuRouter.get('/:slug/c/:categorySlug', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await loadMenu(req.params.slug);
    if (!menu) {
        res.status(404).render('menu/404', { title: 'Menu Not Found' });
        return;
    }
    const category = menu.categories.find((c) => c.slug === req.params.categorySlug);
    if (!category) {
        res.status(404).render('menu/404', { title: 'Category Not Found', menu, baseUrl: `/m/${menu.slug}` });
        return;
    }
    const products = menu.products.filter((p) => p.categoryId === category.id);
    res.render('menu/category', {
        menu,
        category,
        categories: menu.categories,
        products,
        baseUrl: `/m/${menu.slug}`,
        title: `${category.name} — ${menu.businessName || 'Menu'}`,
    });
}));
// GET /m/:slug/p/:productSlug — Product detail page (increments views)
exports.publicMenuRouter.get('/:slug/p/:productSlug', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await loadMenu(req.params.slug);
    if (!menu) {
        res.status(404).render('menu/404', { title: 'Menu Not Found' });
        return;
    }
    const product = menu.products.find((p) => p.slug === req.params.productSlug);
    if (!product) {
        res.status(404).render('menu/404', { title: 'Product Not Found', menu, baseUrl: `/m/${menu.slug}` });
        return;
    }
    // Increment views (fire-and-forget, don't block rendering)
    prisma_1.prisma.product.update({
        where: { id: product.id },
        data: { views: { increment: 1 } },
    }).catch(() => { });
    const category = menu.categories.find((c) => c.id === product.categoryId);
    res.render('menu/product', {
        menu,
        product,
        category,
        categories: menu.categories,
        baseUrl: `/m/${menu.slug}`,
        title: `${product.name} — ${menu.businessName || 'Menu'}`,
    });
}));
//# sourceMappingURL=publicMenu.js.map