"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../services/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const demoMenu_1 = require("../data/demoMenu");
exports.previewRouter = (0, express_1.Router)();
/** Look up a theme by slug, return null if not found */
async function getThemeBySlug(slug) {
    return prisma_1.prisma.theme.findUnique({ where: { slug } });
}
// ── GET /preview/:themeSlug — Demo menu home ───────────────────────────────
exports.previewRouter.get('/:themeSlug', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const theme = await getThemeBySlug(req.params.themeSlug);
    if (!theme) {
        res.status(404).render('menu/404', { title: 'Theme Not Found' });
        return;
    }
    const menu = (0, demoMenu_1.buildDemoMenu)(theme.slug, theme.name);
    const productsByCategory = {};
    for (const cat of demoMenu_1.DEMO_CATEGORIES) {
        productsByCategory[cat.id] = demoMenu_1.DEMO_PRODUCTS.filter(p => p.categoryId === cat.id);
    }
    res.render('menu/home', {
        menu,
        categories: demoMenu_1.DEMO_CATEGORIES,
        productsByCategory,
        baseUrl: `/preview/${theme.slug}`,
        title: `Önizleme: ${theme.name}`,
        isPreview: true,
        previewBannerTheme: theme,
    });
}));
// ── GET /preview/:themeSlug/c/:categorySlug — Demo category page ───────────
exports.previewRouter.get('/:themeSlug/c/:categorySlug', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const theme = await getThemeBySlug(req.params.themeSlug);
    if (!theme) {
        res.status(404).render('menu/404', { title: 'Theme Not Found' });
        return;
    }
    const category = demoMenu_1.DEMO_CATEGORIES.find(c => c.slug === req.params.categorySlug);
    if (!category) {
        res.status(404).render('menu/404', { title: 'Category Not Found' });
        return;
    }
    const menu = (0, demoMenu_1.buildDemoMenu)(theme.slug, theme.name);
    const products = demoMenu_1.DEMO_PRODUCTS.filter(p => p.categoryId === category.id);
    res.render('menu/category', {
        menu,
        category,
        categories: demoMenu_1.DEMO_CATEGORIES,
        products,
        baseUrl: `/preview/${theme.slug}`,
        title: `${category.name} — Önizleme`,
        isPreview: true,
        previewBannerTheme: theme,
    });
}));
// ── GET /preview/:themeSlug/p/:productSlug — Demo product page ────────────
exports.previewRouter.get('/:themeSlug/p/:productSlug', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const theme = await getThemeBySlug(req.params.themeSlug);
    if (!theme) {
        res.status(404).render('menu/404', { title: 'Theme Not Found' });
        return;
    }
    const product = demoMenu_1.DEMO_PRODUCTS.find(p => p.slug === req.params.productSlug);
    if (!product) {
        res.status(404).render('menu/404', { title: 'Product Not Found' });
        return;
    }
    const menu = (0, demoMenu_1.buildDemoMenu)(theme.slug, theme.name);
    const category = demoMenu_1.DEMO_CATEGORIES.find(c => c.id === product.categoryId);
    res.render('menu/product', {
        menu,
        product,
        category,
        categories: demoMenu_1.DEMO_CATEGORIES,
        baseUrl: `/preview/${theme.slug}`,
        title: `${product.name} — Önizleme`,
        isPreview: true,
        previewBannerTheme: theme,
    });
}));
//# sourceMappingURL=preview.js.map