import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { buildDemoMenu, DEMO_CATEGORIES, DEMO_PRODUCTS } from '../data/demoMenu';

export const previewRouter = Router();

/** Look up a theme by slug, return null if not found */
async function getThemeBySlug(slug: string) {
  return prisma.theme.findUnique({ where: { slug } });
}

// ── GET /preview/:themeSlug — Demo menu home ───────────────────────────────
previewRouter.get(
  '/:themeSlug',
  asyncHandler(async (req: Request, res: Response) => {
    const theme = await getThemeBySlug(req.params.themeSlug);
    if (!theme) {
      res.status(404).render('menu/404', { title: 'Theme Not Found' });
      return;
    }

    const menu = buildDemoMenu(theme.slug, theme.name);
    const productsByCategory: Record<string, typeof DEMO_PRODUCTS> = {};
    for (const cat of DEMO_CATEGORIES) {
      productsByCategory[cat.id] = DEMO_PRODUCTS.filter(p => p.categoryId === cat.id);
    }

    res.render('menu/home', {
      menu,
      categories: DEMO_CATEGORIES,
      productsByCategory,
      baseUrl: `/preview/${theme.slug}`,
      title: `Önizleme: ${theme.name}`,
      isPreview: true,
      previewBannerTheme: theme,
    });
  })
);

// ── GET /preview/:themeSlug/c/:categorySlug — Demo category page ───────────
previewRouter.get(
  '/:themeSlug/c/:categorySlug',
  asyncHandler(async (req: Request, res: Response) => {
    const theme = await getThemeBySlug(req.params.themeSlug);
    if (!theme) {
      res.status(404).render('menu/404', { title: 'Theme Not Found' });
      return;
    }

    const category = DEMO_CATEGORIES.find(c => c.slug === req.params.categorySlug);
    if (!category) {
      res.status(404).render('menu/404', { title: 'Category Not Found' });
      return;
    }

    const menu = buildDemoMenu(theme.slug, theme.name);
    const products = DEMO_PRODUCTS.filter(p => p.categoryId === category.id);

    res.render('menu/category', {
      menu,
      category,
      categories: DEMO_CATEGORIES,
      products,
      baseUrl: `/preview/${theme.slug}`,
      title: `${category.name} — Önizleme`,
      isPreview: true,
      previewBannerTheme: theme,
    });
  })
);

// ── GET /preview/:themeSlug/p/:productSlug — Demo product page ────────────
previewRouter.get(
  '/:themeSlug/p/:productSlug',
  asyncHandler(async (req: Request, res: Response) => {
    const theme = await getThemeBySlug(req.params.themeSlug);
    if (!theme) {
      res.status(404).render('menu/404', { title: 'Theme Not Found' });
      return;
    }

    const product = DEMO_PRODUCTS.find(p => p.slug === req.params.productSlug);
    if (!product) {
      res.status(404).render('menu/404', { title: 'Product Not Found' });
      return;
    }

    const menu = buildDemoMenu(theme.slug, theme.name);
    const category = DEMO_CATEGORIES.find(c => c.id === product.categoryId);

    res.render('menu/product', {
      menu,
      product,
      category,
      categories: DEMO_CATEGORIES,
      baseUrl: `/preview/${theme.slug}`,
      title: `${product.name} — Önizleme`,
      isPreview: true,
      previewBannerTheme: theme,
    });
  })
);
